import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseAdmin } from "@/lib/supabase";
import { openai, CHAT_MODEL } from "@/lib/openai";
import { getOrCreateConversation, notifyNewChat, triggerHandoff } from "@/lib/conversations";
import { searchKnowledgeBase } from "@/lib/rag";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const MAX_AGENT_STEPS = 4;

const SYSTEM_PROMPT = `Hablas en nombre de "El Hogar de Tus Sueños", una tienda online de textil y decoración para el hogar
(estores enrollables, ropa de cama, fundas de sofá, cojines, accesorios). Eres cercano y conversacional, como una
persona del equipo escribiendo por WhatsApp: cálido, con algún emoji si encaja de forma natural, sin sonar a robot
ni repetir coletillas tipo "soy el asistente virtual" en cada mensaje. Responde siempre en español.

Puedes usar tu conocimiento general para charlar con naturalidad, dar consejos de decoración, explicar cómo funciona
un estor enrollable, ayudar a elegir colores o combinaciones, opinar, o resolver dudas generales que no dependan de
datos concretos de la tienda. Para eso no necesitas buscar nada, responde con soltura.

Para datos CONCRETOS y específicos de El Hogar de Tus Sueños (colores y modelos exactos en catálogo, precios, tallas,
plazos de envío, políticas de devolución, métodos de pago, horario o contacto) usa la herramienta "buscar_en_catalogo"
antes de responder, no inventes cifras, colores ni políticas. Puedes llamarla varias veces si la pregunta toca varios
temas. Si tras buscar no encuentras el dato, dilo con naturalidad (sin sonar a mensaje de error).

Usa la herramienta "escalar_a_persona" cuando el cliente lo pida explícitamente, esté frustrado o insatisfecho con
tus respuestas, necesite algo que no puedas resolver con la información disponible (precio fuera de catálogo, estado
de un pedido concreto, una reclamación o un defecto), o cuando tras un par de intentos no consigas resolver su duda.
No hace falta que se lo digas tú mismo con un botón: la herramienta ya conecta la conversación con el equipo, así
que tras llamarla simplemente confírmaselo al cliente de forma natural y cercana.`;

const TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "buscar_en_catalogo",
      description:
        "Busca información concreta de El Hogar de Tus Sueños en la base de conocimiento de la tienda: productos, " +
        "colores, precios, tallas, envíos, devoluciones, pagos o contacto. Úsala siempre que necesites un dato " +
        "concreto de la tienda que no sepas con certeza por la conversación.",
      parameters: {
        type: "object",
        properties: {
          consulta: {
            type: "string",
            description: "Qué buscar, en texto natural. Ej: 'colores happystor clear', 'plazos de envío a Canarias'.",
          },
        },
        required: ["consulta"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "escalar_a_persona",
      description:
        "Conecta la conversación con una persona real del equipo de El Hogar de Tus Sueños. Tras llamarla, alguien " +
        "del equipo atenderá al cliente directamente en este mismo chat.",
      parameters: {
        type: "object",
        properties: {
          motivo: {
            type: "string",
            description: "Breve motivo del escalado, para que el equipo tenga contexto al entrar.",
          },
        },
        required: ["motivo"],
      },
    },
  },
];

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// El widget hace polling aquí para recibir mensajes que llegan por otra vía
// (respuesta del admin desde el panel o desde Telegram con /responder).
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json(
      { error: "session_id es obligatorio" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const { data: conversation } = await supabaseAdmin
    .from("conversations")
    .select("id, status")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (!conversation) {
    return NextResponse.json({ status: null, messages: [] }, { headers: CORS_HEADERS });
  }

  const { data: messages } = await supabaseAdmin
    .from("messages")
    .select("role, content, created_at")
    .eq("conversation_id", conversation.id)
    .order("created_at", { ascending: true });

  return NextResponse.json(
    { status: conversation.status, messages: messages ?? [] },
    { headers: CORS_HEADERS }
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const sessionId = body?.session_id as string | undefined;
  const message = (body?.message as string | undefined)?.trim();

  if (!sessionId || !message) {
    return NextResponse.json(
      { error: "session_id y message son obligatorios" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const conversation = await getOrCreateConversation(sessionId);

  await supabaseAdmin.from("messages").insert({
    conversation_id: conversation.id,
    role: "user",
    content: message,
  });

  if (conversation.isNew) {
    await notifyNewChat(conversation.visitorCountry, conversation.visitorCountryCode, message);
  }

  // Si la conversación ya no está en manos del bot, solo guardamos el mensaje:
  // el admin responde desde el panel o Telegram (Supabase Realtime lo entrega al widget).
  if (conversation.status !== "bot") {
    return NextResponse.json(
      { reply: null, status: conversation.status },
      { headers: CORS_HEADERS }
    );
  }

  const { data: history } = await supabaseAdmin
    .from("messages")
    .select("role, content")
    .eq("conversation_id", conversation.id)
    .order("created_at", { ascending: true })
    .limit(10);

  const workingMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...(history ?? []).map((m) => ({
      role: (m.role === "human_agent" ? "assistant" : m.role) as "user" | "assistant",
      content: m.content,
    })),
  ];

  let handoffTriggered = false;
  let reply: string | null = null;

  for (let step = 0; step < MAX_AGENT_STEPS; step++) {
    const completion = await openai.chat.completions.create({
      model: CHAT_MODEL,
      temperature: 0.8,
      tools: TOOLS,
      tool_choice: "auto",
      messages: workingMessages,
    });

    const choice = completion.choices[0]?.message;
    if (!choice) break;

    workingMessages.push(choice);

    if (!choice.tool_calls || choice.tool_calls.length === 0) {
      reply = choice.content?.trim() || null;
      break;
    }

    for (const call of choice.tool_calls) {
      if (call.type !== "function") continue;

      let result: unknown;
      try {
        const args = JSON.parse(call.function.arguments || "{}");

        if (call.function.name === "buscar_en_catalogo") {
          const docs = await searchKnowledgeBase(String(args.consulta ?? message));
          result = docs.length > 0 ? docs : { info: "Sin resultados relevantes en la base de conocimiento." };
        } else if (call.function.name === "escalar_a_persona") {
          await triggerHandoff(conversation.id);
          handoffTriggered = true;
          result = { ok: true, info: "Conversación escalada, el equipo la atenderá en este chat." };
        } else {
          result = { error: "Herramienta desconocida." };
        }
      } catch {
        result = { error: "No se pudo ejecutar la herramienta." };
      }

      workingMessages.push({
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify(result),
      });
    }
  }

  if (!reply) {
    reply = "Lo siento, no he podido procesar tu mensaje. ¿Puedes reformularlo?";
  }

  await supabaseAdmin.from("messages").insert({
    conversation_id: conversation.id,
    role: "assistant",
    content: reply,
  });

  return NextResponse.json(
    { reply, status: handoffTriggered ? "waiting_human" : "bot" },
    { headers: CORS_HEADERS }
  );
}
