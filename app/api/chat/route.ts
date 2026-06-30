import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { openai, CHAT_MODEL, EMBEDDING_MODEL } from "@/lib/openai";
import { getOrCreateConversation, notifyNewChat, triggerHandoff } from "@/lib/conversations";
import { detectHandoffIntent } from "@/lib/handoff";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const MATCH_THRESHOLD = 0.35;
const MATCH_COUNT = 6;

const SYSTEM_PROMPT = `Hablas en nombre de "El Hogar de Tus Sueños", una tienda online de textil y decoración para el hogar
(estores enrollables, ropa de cama, fundas de sofá, cojines, accesorios). Eres cercano y conversacional, como una
persona del equipo escribiendo por WhatsApp: cálido, con algún emoji si encaja de forma natural, sin sonar a robot
ni repetir coletillas tipo "soy el asistente virtual" en cada mensaje. Responde siempre en español.

Puedes usar tu conocimiento general para charlar con naturalidad, dar consejos de decoración, explicar cómo funciona
un estor enrollable, ayudar a elegir colores o combinaciones, opinar, o resolver dudas generales que no dependan de
datos concretos de la tienda. Para eso no necesitas el contexto, responde con soltura.

Para datos CONCRETOS y específicos de El Hogar de Tus Sueños (colores y modelos exactos en catálogo, precios, tallas,
plazos de envío, políticas de devolución, métodos de pago, horario o contacto) básate únicamente en el contexto
proporcionado abajo: no inventes cifras, colores ni políticas que no aparezcan ahí. Si no tienes ese dato concreto,
dilo con naturalidad (sin sonar como un mensaje de error) y ofrece pulsar el botón "🙋 Hablar con una persona" que
aparece justo debajo de la conversación para que el equipo lo confirme.`;

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

  if (detectHandoffIntent(message)) {
    await triggerHandoff(conversation.id);

    const ackReply = "Entendido, te conecto con una persona de nuestro equipo lo antes posible. En unos minutos te atenderán por aquí mismo.";
    await supabaseAdmin.from("messages").insert({
      conversation_id: conversation.id,
      role: "assistant",
      content: ackReply,
    });

    return NextResponse.json(
      { reply: ackReply, status: "waiting_human" },
      { headers: CORS_HEADERS }
    );
  }

  // RAG: embeber el mensaje y recuperar documentos relevantes de knowledge_base
  const embeddingRes = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: message,
  });
  const queryEmbedding = embeddingRes.data[0].embedding;

  const { data: matches } = await supabaseAdmin.rpc("match_documents", {
    query_embedding: queryEmbedding,
    match_threshold: MATCH_THRESHOLD,
    match_count: MATCH_COUNT,
  });

  const context = (matches ?? [])
    .map((m: { title: string; content: string }) => `### ${m.title}\n${m.content}`)
    .join("\n\n");

  const { data: history } = await supabaseAdmin
    .from("messages")
    .select("role, content")
    .eq("conversation_id", conversation.id)
    .order("created_at", { ascending: true })
    .limit(10);

  const completion = await openai.chat.completions.create({
    model: CHAT_MODEL,
    temperature: 0.8,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "system",
        content: context
          ? `Contexto relevante de la base de conocimiento:\n\n${context}`
          : "No se ha encontrado contexto relevante en la base de conocimiento para esta pregunta. Si la pregunta es general (no depende de datos concretos de la tienda), respóndela igualmente con tu conocimiento general.",
      },
      ...(history ?? []).map((m) => ({
        role: (m.role === "human_agent" ? "assistant" : m.role) as "user" | "assistant",
        content: m.content,
      })),
    ],
  });

  const reply = completion.choices[0]?.message?.content?.trim() ?? "Lo siento, no he podido procesar tu mensaje. ¿Puedes reformularlo?";

  await supabaseAdmin.from("messages").insert({
    conversation_id: conversation.id,
    role: "assistant",
    content: reply,
  });

  return NextResponse.json({ reply, status: "bot" }, { headers: CORS_HEADERS });
}
