// Registra la URL del webhook de Telegram. Ejecutar UNA VEZ tras desplegar
// (el dominio debe ser público y HTTPS; Telegram no acepta localhost).
// Uso: node --env-file=.env scripts/set-telegram-webhook.mjs

const token = process.env.TELEGRAM_BOT_TOKEN;
const baseUrl = process.env.NEXTAUTH_URL;

if (!token || !baseUrl) {
  console.error("Faltan TELEGRAM_BOT_TOKEN o NEXTAUTH_URL en el .env");
  process.exit(1);
}

const webhookUrl = `${baseUrl}/api/telegram/webhook`;

const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}`);
const data = await res.json();

console.log(data);

if (!data.ok) {
  console.error("No se pudo registrar el webhook.");
  process.exit(1);
}

console.log(`Webhook registrado en: ${webhookUrl}`);
