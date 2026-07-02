import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const sessionId = body?.session_id as string | undefined;

  if (!sessionId) {
    return NextResponse.json({ error: "session_id requerido" }, { status: 400, headers: CORS_HEADERS });
  }

  const { data: conv } = await supabaseAdmin
    .from("conversations")
    .select("id, status")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (!conv) {
    return NextResponse.json({ ok: true }, { headers: CORS_HEADERS });
  }

  // Solo cerrar si el bot o está esperando humano — si ya hay un humano atendiendo, no interrumpir
  if (conv.status === "bot" || conv.status === "waiting_human") {
    await supabaseAdmin
      .from("conversations")
      .update({ status: "closed" })
      .eq("id", conv.id);

    await supabaseAdmin.from("messages").insert({
      conversation_id: conv.id,
      role: "system",
      content: "El cliente ha cerrado el chat",
    });
  }

  return NextResponse.json({ ok: true }, { headers: CORS_HEADERS });
}
