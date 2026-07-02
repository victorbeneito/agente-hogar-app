import { supabaseAdmin } from "@/lib/supabase";
import { sendTelegramMessage } from "@/lib/telegram";
import { countryCodeToFlag, lookupGeo } from "@/lib/geo";

export async function getOrCreateConversation(sessionId: string, requestHeaders?: Headers) {
  const { data: existing } = await supabaseAdmin
    .from("conversations")
    .select("id, status")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (existing) {
    return {
      ...existing,
      isNew: false,
      visitorCountry: undefined as string | null | undefined,
      visitorCountryCode: undefined as string | null | undefined,
    };
  }

  const { data: visitor } = await supabaseAdmin
    .from("visitors")
    .select("device, browser, country, country_code, current_page, referrer")
    .eq("session_id", sessionId)
    .order("last_seen", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (visitor) {
    await supabaseAdmin.from("visitors").update({ has_chatted: true }).eq("session_id", sessionId);
  }

  // Si el visitor no tiene país, usar geo de los headers del request como fallback
  let country = visitor?.country ?? null;
  let countryCode = visitor?.country_code ?? null;
  if ((!country || !countryCode) && requestHeaders) {
    const geo = await lookupGeo("", requestHeaders);
    country = country ?? geo.country;
    countryCode = countryCode ?? geo.countryCode;
  }

  const { data: created, error } = await supabaseAdmin
    .from("conversations")
    .insert({
      session_id: sessionId,
      status: "bot",
      metadata: {
        device: visitor?.device ?? null,
        browser: visitor?.browser ?? null,
        country: country ?? null,
        country_code: countryCode ?? null,
        entry_page: visitor?.current_page ?? null,
        referrer: visitor?.referrer ?? null,
      },
    })
    .select("id, status")
    .single();

  if (error || !created) {
    throw new Error(`No se pudo crear la conversación: ${error?.message}`);
  }

  return { ...created, isNew: true, visitorCountry: country, visitorCountryCode: countryCode };
}

export async function notifyNewChat(country: string | null | undefined, countryCode: string | null | undefined, firstMessage: string) {
  const flag = countryCodeToFlag(countryCode ?? null);
  await sendTelegramMessage(
    `💬 Nuevo chat abierto - Visitante desde ${flag} ${country ?? "Desconocido"} pregunta:\n"${firstMessage}"`
  );
}

export async function sendHumanMessage(conversationId: string, content: string) {
  await supabaseAdmin.from("messages").insert({
    conversation_id: conversationId,
    role: "human_agent",
    content,
  });

  await supabaseAdmin.from("conversations").update({ status: "human" }).eq("id", conversationId);
}

export async function triggerHandoff(conversationId: string) {
  await supabaseAdmin.from("conversations").update({ status: "waiting_human" }).eq("id", conversationId);

  const [{ data: conv }, { data: lastMessages }] = await Promise.all([
    supabaseAdmin
      .from("conversations")
      .select("metadata")
      .eq("id", conversationId)
      .maybeSingle(),
    supabaseAdmin
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const countryCode = (conv?.metadata as Record<string, string> | null)?.country_code ?? null;
  const country = (conv?.metadata as Record<string, string> | null)?.country ?? null;
  const flag = countryCodeToFlag(countryCode);

  const summary = (lastMessages ?? [])
    .reverse()
    .map((m) => `${m.role === "user" ? "Cliente" : "Bot"}: ${m.content}`)
    .join("\n");

  await sendTelegramMessage(
    `🚨 ATENCIÓN REQUERIDA - El cliente ${flag} ${country ?? "Desconocido"} quiere hablar con una persona.\n` +
      `Resumen:\n${summary}\n` +
      `Ver conversación: https://agente.elhogardetusuenos.com/admin/conversaciones?id=${conversationId}`
  );
}
