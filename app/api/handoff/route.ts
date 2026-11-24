import { NextRequest, NextResponse } from "next/server";
import { getOrCreateConversation, notifyNewChat, triggerHandoff } from "@/lib/conversations";
import { ChatRateLimitError, isBotUserAgent } from "@/lib/botGuard";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const sessionId = body?.session_id as string | undefined;

  if (!sessionId) {
    return NextResponse.json(
      { error: "session_id es obligatorio" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  if (isBotUserAgent(request.headers.get("user-agent"))) {
    return NextResponse.json({ error: "No permitido" }, { status: 403, headers: CORS_HEADERS });
  }

  let conversation: Awaited<ReturnType<typeof getOrCreateConversation>>;
  try {
    conversation = await getOrCreateConversation(sessionId, request.headers);
  } catch (err) {
    if (err instanceof ChatRateLimitError) {
      return NextResponse.json({ error: err.userMessage }, { status: 429, headers: CORS_HEADERS });
    }
    throw err;
  }

  if (conversation.isNew) {
    await notifyNewChat(conversation.visitorCountry, conversation.visitorCountryCode, "(solicita hablar con una persona directamente)");
  }

  // Si ya está escalada o atendida por una persona no se vuelve a avisar
  // (evita que alguien repita la petición para inundar Telegram de alertas 🚨)
  if (conversation.status !== "waiting_human" && conversation.status !== "human") {
    await triggerHandoff(conversation.id);
  }

  return NextResponse.json({ ok: true }, { headers: CORS_HEADERS });
}
