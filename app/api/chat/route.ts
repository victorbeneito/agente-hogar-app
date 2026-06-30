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
const MATCH_COUNT = 4;

const SYSTEM_PROMPT = `Eres el asistente virtual de "El Hogar de Tus Sueños", una tienda online de textil para el hogar
(estores enrollables, colchas, fundas de sofá, fundas nórdicas). Responde siempre en español, de forma cercana,
breve y clara. Usa exclusivamente la información de contexto proporcionada para responder sobre productos, envíos,
devoluciones o pagos. Si no tienes información suficiente en el contexto para responder con seguridad, dilo
honestamente y dile al cliente que puede pulsar el botón "🙋 Hablar con una persona" que aparece justo debajo de
la conversación para que alguien del equipo le atienda directamente. No inventes precios, plazos, marcas ni
políticas que no aparezcan en el contexto.`;

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
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "system",
        content: context
          ? `Contexto relevante de la base de conocimiento:\n\n${context}`
          : "No se ha encontrado contexto relevante en la base de conocimiento para esta pregunta.",
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
