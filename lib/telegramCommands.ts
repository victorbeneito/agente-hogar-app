import { supabaseAdmin } from "@/lib/supabase";
import { countryCodeToFlag } from "@/lib/geo";
import { getStats } from "@/lib/stats";
import { sendHumanMessage } from "@/lib/conversations";

const FIVE_MINUTES_MS = 5 * 60 * 1000;

function minutesAgo(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.max(0, Math.round(diffMs / 60000));
  if (minutes < 1) return "ahora mismo";
  if (minutes === 1) return "hace 1 min";
  return `hace ${minutes} min`;
}

export async function handleActivos(): Promise<string> {
  const since = new Date(Date.now() - FIVE_MINUTES_MS).toISOString();

  const { data: visitors } = await supabaseAdmin
    .from("visitors")
    .select("country, country_code, device, current_page, last_seen, has_chatted")
    .gte("last_seen", since)
    .order("last_seen", { ascending: false })
    .limit(20);

  if (!visitors || visitors.length === 0) {
    return "📭 No hay visitantes activos en este momento.";
  }

  const lines = visitors.map((v) => {
    const flag = countryCodeToFlag(v.country_code);
    const chatIcon = v.has_chatted ? "💬" : "";
    return `${flag} ${v.country ?? "Desconocido"} - ${v.current_page ?? "?"} - ${v.device ?? "?"} - ${minutesAgo(v.last_seen)} ${chatIcon}`;
  });

  return `👥 <b>Visitantes activos (${visitors.length})</b>\n\n${lines.join("\n")}`;
}

export async function handleChats(): Promise<string> {
  const { data: conversations } = await supabaseAdmin
    .from("conversations")
    .select("session_id, status, updated_at, metadata")
    .neq("status", "closed")
    .order("updated_at", { ascending: false })
    .limit(20);

  if (!conversations || conversations.length === 0) {
    return "📭 No hay conversaciones abiertas.";
  }

  const statusEmoji: Record<string, string> = {
    bot: "🤖",
    waiting_human: "🚨",
    human: "🧑‍💼",
  };

  const lines = conversations.map((c) => {
    const country = (c.metadata as { country?: string } | null)?.country ?? "Desconocido";
    const emoji = statusEmoji[c.status] ?? "💬";
    return `${emoji} <code>${c.session_id}</code>\n${country} - ${c.status} - ${minutesAgo(c.updated_at)}`;
  });

  return `💬 <b>Conversaciones abiertas (${conversations.length})</b>\n\n${lines.join("\n\n")}`;
}

export async function handleResponder(sessionId: string, mensaje: string): Promise<string> {
  const { data: conversation } = await supabaseAdmin
    .from("conversations")
    .select("id")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (!conversation) {
    return `❌ No se encontró ninguna conversación con session_id <code>${sessionId}</code>`;
  }

  await sendHumanMessage(conversation.id, mensaje);

  return `✅ Mensaje enviado a <code>${sessionId}</code>`;
}

export async function handleSilenciar(sessionId: string): Promise<string> {
  const { error } = await supabaseAdmin
    .from("conversations")
    .update({ status: "human" })
    .eq("session_id", sessionId);

  if (error) return `❌ No se encontró ninguna conversación con session_id <code>${sessionId}</code>`;
  return `🔇 Bot silenciado para <code>${sessionId}</code>. Ahora tú llevas la conversación (usa /responder).`;
}

export async function handleBot(sessionId: string): Promise<string> {
  const { error } = await supabaseAdmin
    .from("conversations")
    .update({ status: "bot" })
    .eq("session_id", sessionId);

  if (error) return `❌ No se encontró ninguna conversación con session_id <code>${sessionId}</code>`;
  return `🤖 Bot reactivado para <code>${sessionId}</code>`;
}

export async function handleStats(): Promise<string> {
  const stats = await getStats();

  return (
    `📊 <b>Estadísticas de hoy</b>\n\n` +
    `👥 Visitantes: ${stats.visitorsToday}\n` +
    `💬 Chats iniciados: ${stats.chatsIniciados}\n` +
    `🚨 Esperando atención humana: ${stats.esperandoHumano}\n` +
    `🤖 Resueltos por el bot: ${stats.resueltosPorBot} (${stats.pctResueltos}%)`
  );
}

export function helpText(): string {
  return (
    `🤖 <b>Comandos disponibles</b>\n\n` +
    `/activos — visitantes en el sitio ahora mismo\n` +
    `/chats — conversaciones abiertas\n` +
    `/responder [session_id] [mensaje] — responde al cliente\n` +
    `/silenciar [session_id] — silencia el bot, tomas el control\n` +
    `/bot [session_id] — reactiva el bot\n` +
    `/stats — estadísticas del día`
  );
}
