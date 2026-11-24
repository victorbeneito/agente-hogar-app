import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseAdmin } from "@/lib/supabase";
import { openai, CHAT_MODEL } from "@/lib/openai";
import { getOrCreateConversation, notifyNewChat, triggerHandoff } from "@/lib/conversations";
import { searchKnowledgeBase } from "@/lib/rag";
import { calcularEstorDigitalAMedida } from "@/lib/estorDigitalMedida";
import { assertCanSendMessage, ChatRateLimitError, isBotUserAgent, MAX_MESSAGE_LENGTH } from "@/lib/botGuard";

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

5. UNA MEDIDA NO ES UN PRODUCTO: LOS ESTORES SE HACEN A MEDIDA.
   La regla 2 es para diseños o referencias que no existen, NO para medidas. Los estores enrollables (lisos y digitales) se fabrican bajo pedido: que una medida no aparezca en la lista de tallas estándar o en la tarifa NO significa que no la tengamos. Nunca respondas "no tenemos esa medida".
   - Estor DIGITAL (estampado, diseño del catálogo o foto propia) con una medida concreta (aunque sea solo el ancho) → llama SIEMPRE a "calcular_estor_digital_a_medida" con las medidas en cm (1,60 m = 160 cm; 3 metros = 300 cm). No calcules tú la talla ni el precio: usa exactamente la talla base, el precio y la indicación que devuelva. Si devuelve fuera_de_rango, no des ningún precio.
   - Estor LISO con una medida concreta → busca en el catálogo y da el precio de la tarifa.
   Acompaña siempre el enlace https://elhogardetusuenos.com/medidas-personalizadas cuando sea un estor digital a medida.

6. ESCALA A UNA PERSONA cuando:

5. ESCALA A UNA PERSONA cuando:
   - El cliente lo pida explícitamente.
   - Esté frustrado o insatisfecho con tus respuestas.
   - Tras dos búsquedas no hayas podido resolver su duda.
   - Necesite algo fuera del catálogo (estado de pedido, reclamación, presupuesto especial).
   Tras llamar a "escalar_a_persona", confírmaselo al cliente de forma natural y breve.

═══ COMPORTAMIENTO ESPERADO ═══
- Preguntan dónde están las fundas nórdicas → buscas en catálogo → das el enlace directo.
- Preguntan por un diseño específico que no existe → buscas → dices que no lo tienes → ofreces persona o categoría alternativa SI EL CLIENTE LA PIDE.
- Preguntan por política de envíos → buscas en catálogo → respondes con los datos exactos del catálogo.
- Piden un estor digital de 160x150 → llamas a calcular_estor_digital_a_medida(160, 150) → "¡Sí, lo hacemos a medida!" → explicas que se elige la talla base que devuelve y se indica 160x150 en los comentarios del pedido → precio orientativo → enlace a medidas personalizadas.`;

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
      name: "calcular_estor_digital_a_medida",
      description:
        "Calcula cómo pedir un estor enrollable DIGITAL (estampado o foto) a una medida concreta: talla base que el " +
        "cliente debe elegir en la web, precio orientativo e instrucciones, o si la medida está fuera de rango y hay que consultarla.",
      parameters: {
        type: "object",
        properties: {
          ancho_cm: { type: "number", description: "Ancho pedido en centímetros." },
          largo_cm: { type: "number", description: "Largo (alto) pedido en centímetros. Omítelo si el cliente solo ha dado el ancho." },
        },
        required: ["ancho_cm"],
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

  // Protección: bots fuera, mensajes acotados y límites de frecuencia
  if (isBotUserAgent(request.headers.get("user-agent"))) {
    return NextResponse.json({ error: "No permitido" }, { status: 403, headers: CORS_HEADERS });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { reply: `Tu mensaje es demasiado largo. Por favor, resúmelo en menos de ${MAX_MESSAGE_LENGTH} caracteres.`, status: null },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  let conversation: Awaited<ReturnType<typeof getOrCreateConversation>>;
  try {
    conversation = await getOrCreateConversation(sessionId, request.headers);
    await assertCanSendMessage(conversation.id);
  } catch (err) {
    if (err instanceof ChatRateLimitError) {
      return NextResponse.json(
        { reply: err.userMessage, status: null },
        { status: 429, headers: CORS_HEADERS }
      );
    }
    throw err;
  }

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
    .in("role", ["user", "assistant", "human_agent"])
    .order("created_at", { ascending: false })
    .limit(10);

  // Se piden los 10 más recientes (orden descendente) y se reordenan cronológicamente
  const recentHistory = (history ?? []).reverse();

  const workingMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...recentHistory.map((m) => ({
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
        } else if (call.function.name === "calcular_estor_digital_a_medida") {
          result = calcularEstorDigitalAMedida(
            Number(args.ancho_cm),
            args.largo_cm == null ? undefined : Number(args.largo_cm)
          );
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
