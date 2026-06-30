import { NextRequest, NextResponse } from "next/server";
import { sendTelegramMessage } from "@/lib/telegram";
import {
  handleActivos,
  handleChats,
  handleResponder,
  handleSilenciar,
  handleBot,
  handleStats,
  helpText,
} from "@/lib/telegramCommands";

interface TelegramUpdate {
  message?: {
    chat: { id: number };
    text?: string;
  };
}

export async function POST(request: NextRequest) {
  const update = (await request.json().catch(() => null)) as TelegramUpdate | null;
  const message = update?.message;
  const text = message?.text?.trim();

  // Solo se procesan mensajes del admin (TELEGRAM_CHAT_ID), para que nadie más
  // pueda controlar las conversaciones aunque descubra la URL del webhook.
  if (!message || !text || String(message.chat.id) !== process.env.TELEGRAM_CHAT_ID) {
    return NextResponse.json({ ok: true });
  }

  const [command, ...rest] = text.split(" ");

  try {
    let reply: string;

    switch (command) {
      case "/start":
      case "/help":
        reply = helpText();
        break;

      case "/activos":
        reply = await handleActivos();
        break;

      case "/chats":
        reply = await handleChats();
        break;

      case "/responder": {
        const sessionId = rest[0];
        const mensaje = rest.slice(1).join(" ");
        if (!sessionId || !mensaje) {
          reply = "Uso: /responder [session_id] [mensaje]";
        } else {
          reply = await handleResponder(sessionId, mensaje);
        }
        break;
      }

      case "/silenciar": {
        const sessionId = rest[0];
        reply = sessionId ? await handleSilenciar(sessionId) : "Uso: /silenciar [session_id]";
        break;
      }

      case "/bot": {
        const sessionId = rest[0];
        reply = sessionId ? await handleBot(sessionId) : "Uso: /bot [session_id]";
        break;
      }

      case "/stats":
        reply = await handleStats();
        break;

      default:
        reply = "No reconozco ese comando. Envía /help para ver la lista de comandos.";
    }

    await sendTelegramMessage(reply);
  } catch (err) {
    console.error("Error procesando comando de Telegram:", err);
    await sendTelegramMessage("⚠️ Ocurrió un error procesando el comando.");
  }

  return NextResponse.json({ ok: true });
}
