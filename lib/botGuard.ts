// Protección frente a bots y abuso: detección por User-Agent, filtro de países
// para las notificaciones de Telegram y límites de uso del chat.
import { supabaseAdmin } from "@/lib/supabase";

// Países de venta: solo se notifica por Telegram a visitantes/chats de estos países.
// Configurable con ALLOWED_COUNTRIES="ES,PT,IT" (códigos ISO separados por comas).
const ALLOWED_COUNTRIES = (process.env.ALLOWED_COUNTRIES ?? "ES,PT,IT")
  .split(",")
  .map((c) => c.trim().toUpperCase())
  .filter(Boolean);

// Límites anti-abuso del chat (cada mensaje cuesta una llamada a OpenAI)
export const MAX_MESSAGE_LENGTH = 1000;
const MAX_MESSAGES_PER_MINUTE = 6;
const MAX_MESSAGES_PER_CONVERSATION = 80;
const MAX_NEW_CHATS_PER_IP_PER_HOUR = 10;

// Crawlers, herramientas de scraping, navegadores automatizados y escáneres.
// (?<!cu) evita marcar como bot los móviles de la marca Cubot.
const BOT_UA_PATTERN =
  /(?<!cu)bot(?![a-z])|crawl|spider|slurp|headless|lighthouse|pagespeed|gtmetrix|pingdom|uptime|facebookexternalhit|python|curl|wget|axios|node-fetch|undici|go-http|java\/|okhttp|httpclient|libwww|scrapy|phantom|selenium|puppeteer|playwright|webdriver|semrush|ahrefs|mj12|dotbot|bytespider|petalbot|yandex|baidu|sogou|gptbot|claudebot|ccbot|censys|zgrab|masscan|nuclei|nmap/i;

export function isBotUserAgent(userAgent: string | null): boolean {
  if (!userAgent || userAgent.length < 20) return true; // los navegadores reales siempre envían un UA largo
  return BOT_UA_PATTERN.test(userAgent);
}

// País desconocido → se notifica (puede ser un cliente real con geolocalización fallida)
export function isNotifiableCountry(countryCode: string | null | undefined): boolean {
  if (!countryCode) return true;
  return ALLOWED_COUNTRIES.includes(countryCode.toUpperCase());
}

export class ChatRateLimitError extends Error {
  constructor(public readonly userMessage: string) {
    super(userMessage);
    this.name = "ChatRateLimitError";
  }
}

// Evita que un mismo origen abra decenas de chats rotando el session_id
export async function assertCanOpenChat(ip: string) {
  if (!ip) return;
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabaseAdmin
    .from("conversations")
    .select("id", { count: "exact", head: true })
    .eq("metadata->>ip", ip)
    .gte("created_at", since);

  if ((count ?? 0) >= MAX_NEW_CHATS_PER_IP_PER_HOUR) {
    throw new ChatRateLimitError(
      "Se han abierto demasiados chats desde tu conexión. Por favor, inténtalo más tarde."
    );
  }
}

// Limita la frecuencia y el total de mensajes del cliente en una conversación
export async function assertCanSendMessage(conversationId: string) {
  const since = new Date(Date.now() - 60 * 1000).toISOString();
  const [{ count: lastMinute }, { count: total }] = await Promise.all([
    supabaseAdmin
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("conversation_id", conversationId)
      .eq("role", "user")
      .gte("created_at", since),
    supabaseAdmin
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("conversation_id", conversationId)
      .eq("role", "user"),
  ]);

  if ((lastMinute ?? 0) >= MAX_MESSAGES_PER_MINUTE) {
    throw new ChatRateLimitError("Estás enviando mensajes muy rápido. Espera unos segundos y vuelve a intentarlo 🙂");
  }
  if ((total ?? 0) >= MAX_MESSAGES_PER_CONVERSATION) {
    throw new ChatRateLimitError(
      "Esta conversación ha alcanzado el límite de mensajes. Si necesitas más ayuda, pulsa «Hablar con una persona»."
    );
  }
}
