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

const SYSTEM_PROMPT = `Eres el asistente virtual de "El Hogar de Tus Sueños" (elhogardetusuenos.com), tienda online española de textil y decoración para el hogar: estores enrollables, ropa de cama, fundas de sofá, cojines y accesorios.
Escribe siempre en español. Sé cercano y directo, como un compañero del equipo por WhatsApp: breve, cálido, sin rodeos. Usa algún emoji si encaja de forma natural, pero sin abusar.

═══ REGLAS QUE NUNCA DEBES ROMPER ═══

1. BUSCA SIEMPRE ANTES DE RESPONDER SOBRE PRODUCTOS.
   Cada vez que el cliente pregunte por un producto concreto, una categoría, un diseño, un color, un precio o una talla, llama a "buscar_en_catalogo" antes de responder. No respondas de memoria aunque creas saber la respuesta; el catálogo puede haber cambiado.

2. SI NO ENCUENTRAS EL PRODUCTO, DI LA VERDAD SIN IMPROVISAR ALTERNATIVAS.
   Si buscas y no encuentras el producto exacto que pide el cliente, di simplemente que no tienes esa referencia concreta en el catálogo. NO ofrezcas productos de otras categorías que no se han pedido (p.ej., si piden estores digitales no respondas con estores lisos o día/noche). Puedes ofrecer escalar a una persona para comprobar el catálogo completo.

3. PROPORCIONA SIEMPRE EL ENLACE A LA CATEGORÍA.
   Cuando el cliente pregunte dónde encontrar un producto o cómo verlo en la web, da el enlace directo que aparezca en el catálogo. Si el catálogo no tiene el enlace, indica la ruta de navegación en la web (p.ej., "Menú → Estores → Digitales").

4. NO INVENTES PRECIOS, TALLAS NI CARACTERÍSTICAS.
   Si el catálogo no tiene ese dato, di que no tienes el dato concreto y ofrece hablar con una persona.

5. ESCALA A UNA PERSONA cuando:
   - El cliente lo pida explícitamente.
   - Esté frustrado o insatisfecho con tus respuestas.
   - Tras dos búsquedas no hayas podido resolver su duda.
   - Necesite algo fuera del catálogo (estado de pedido, reclamación, presupuesto especial).
   Tras llamar a "escalar_a_persona", confírmaselo al cliente de forma natural y breve.

═══ COMPORTAMIENTO ESPERADO ═══
- Preguntan dónde están las fundas nórdicas → buscas en catálogo → das el enlace directo.
- Preguntan por un diseño específico que no existe → buscas → dices que no lo tienes → ofreces persona o categoría alternativa SI EL CLIENTE LA PIDE.
- Preguntan por política de envíos → buscas en catálogo → respondes con los datos exactos del catálogo.`;

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

  const conversation = await getOrCreateConversation(sessionId, request.headers);

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
