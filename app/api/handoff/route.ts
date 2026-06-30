import { NextRequest, NextResponse } from "next/server";
import { getOrCreateConversation, notifyNewChat, triggerHandoff } from "@/lib/conversations";

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

  const conversation = await getOrCreateConversation(sessionId);

  if (conversation.isNew) {
    await notifyNewChat(conversation.visitorCountry, conversation.visitorCountryCode, "(solicita hablar con una persona directamente)");
  }

  await triggerHandoff(conversation.id);

  return NextResponse.json({ ok: true }, { headers: CORS_HEADERS });
}
