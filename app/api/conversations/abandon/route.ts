import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendTelegramMessage } from "@/lib/telegram";
import { countryCodeToFlag } from "@/lib/geo";

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
    .select("id, status, metadata")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (!conv) {
    return NextResponse.json({ ok: true }, { headers: CORS_HEADERS });
  }

  // Cerrar salvo que ya esté cerrada — el cliente se ha ido, da igual quién atendía
  if (conv.status !== "closed") {
    const wasHuman = conv.status === "human" || conv.status === "waiting_human";

    await supabaseAdmin
      .from("conversations")
      .update({ status: "closed" })
      .eq("id", conv.id);

    await supabaseAdmin.from("messages").insert({
      conversation_id: conv.id,
      role: "system",
      content: "El cliente ha cerrado el chat",
    });

    if (wasHuman) {
      const metadata = conv.metadata as Record<string, string> | null;
      const flag = countryCodeToFlag(metadata?.country_code ?? null);
      await sendTelegramMessage(
        `❌ El cliente ${flag} ${metadata?.country ?? "Desconocido"} ha abandonado el chat - Conversación cerrada`
      );
    }
  }

  return NextResponse.json({ ok: true }, { headers: CORS_HEADERS });
}
