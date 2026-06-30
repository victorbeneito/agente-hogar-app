// Palabras clave que detectan que el cliente quiere hablar con una persona

const HANDOFF_KEYWORDS = [
  "hablar con una persona",
  "hablar con alguien",
  "hablar con un humano",
  "hablar con un agente",
  "hablar con un operador",
  "agente humano",
  "persona real",
  "atención humana",
  "quiero un humano",
  "necesito hablar con alguien",
  "no eres de ayuda",
  "esto no funciona",
];

export function detectHandoffIntent(message: string): boolean {
  const normalized = message.toLowerCase();
  return HANDOFF_KEYWORDS.some((keyword) => normalized.includes(keyword));
}
