import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getClientIp, lookupGeo, countryCodeToFlag } from "@/lib/geo";
import { parseUserAgent } from "@/lib/device";
import { sendTelegramMessage } from "@/lib/telegram";

const MAX_PAGES_VISITED = 50;

// El tracker se incrusta en elhogardetusuenos.com (otro dominio), por lo
// que esta API necesita cabeceras CORS para aceptar la petición.
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
  const page = body?.page as string | undefined;
  const referrer = (body?.referrer as string | undefined) || null;

  if (!sessionId || !page) {
    return NextResponse.json(
      { error: "session_id y page son obligatorios" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const ip = getClientIp(request.headers);
  const { device, browser } = parseUserAgent(request.headers.get("user-agent"));

  const { data: existing } = await supabaseAdmin
    .from("visitors")
    .select("id, current_page, pages_visited")
    .eq("session_id", sessionId)
    .order("last_seen", { ascending: false })
    .limit(1)
    .maybeSingle();

  const now = new Date().toISOString();

  if (existing) {
    const pagesVisited = Array.isArray(existing.pages_visited) ? existing.pages_visited : [];
    const isNewPage = existing.current_page !== page;

    const updatedPages = isNewPage
      ? [...pagesVisited, { url: page, timestamp: now }].slice(-MAX_PAGES_VISITED)
      : pagesVisited;

    await supabaseAdmin
      .from("visitors")
      .update({
        current_page: page,
        last_seen: now,
        pages_visited: updatedPages,
      })
      .eq("id", existing.id);

    return NextResponse.json({ ok: true, new_visitor: false }, { headers: CORS_HEADERS });
  }

  // Visitante nuevo: geolocalizar y notificar por Telegram
  const geo = await lookupGeo(ip, request.headers);

  const { error: insertError } = await supabaseAdmin.from("visitors").insert({
    session_id: sessionId,
    ip,
    country: geo.country,
    country_code: geo.countryCode,
    city: geo.city,
    device,
    browser,
    current_page: page,
    referrer,
    pages_visited: [{ url: page, timestamp: now }],
    first_seen: now,
    last_seen: now,
  });

  if (insertError) {
    console.error("Error insertando visitante:", insertError);
    return NextResponse.json(
      { error: "Error guardando visitante" },
      { status: 500, headers: CORS_HEADERS }
    );
  }

  const flag = countryCodeToFlag(geo.countryCode);
  const deviceLabel = device === "mobile" ? "móvil" : device === "tablet" ? "tablet" : "escritorio";
  const rawVercelCode = request.headers.get("x-vercel-ip-country") ?? "–";

  await sendTelegramMessage(
    `👤 Nuevo visitante desde ${flag} ${geo.country ?? "Desconocido"}\n` +
      `Viendo: ${page}\n` +
      `Dispositivo: ${deviceLabel} (${browser})\n` +
      `IP: ${ip} · Vercel-code: ${rawVercelCode}`
  );

  return NextResponse.json({ ok: true, new_visitor: true }, { headers: CORS_HEADERS });
}
