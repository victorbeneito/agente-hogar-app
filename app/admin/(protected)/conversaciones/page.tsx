"use client";

import { useEffect, useRef, useState } from "react";

interface ConversationSummary {
  id: string;
  session_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  metadata: { country?: string; entry_page?: string; device?: string } | null;
}

interface Message {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

const STATUS_LABEL: Record<string, string> = {
  bot: "🤖 Bot",
  waiting_human: "🚨 Esperando",
  human: "🧑‍💼 En curso",
  closed: "✅ Cerrada",
};

function timeAgo(iso: string) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "ahora";
  if (minutes < 60) return `hace ${minutes} min`;
  return `hace ${Math.round(minutes / 60)} h`;
}

const PAGE_SIZE = 12;

export default function ConversacionesPage() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<ConversationSummary | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Carga lista de conversaciones abiertas con polling
  useEffect(() => {
    let active = true;
    async function load() {
      const res = await fetch(`/api/conversations?status=open&page=${page}&limit=${PAGE_SIZE}`);
      if (!res.ok || !active) return;
      const data = await res.json();
      setConversations(data.conversations);
      setTotal(data.total ?? 0);
    }
    load();
    const interval = setInterval(load, 5000);
    return () => { active = false; clearInterval(interval); };
  }, [page]);

  // Carga mensajes de la conversación seleccionada con polling
  useEffect(() => {
    if (!selectedId) return;
    let active = true;
    async function load() {
      const res = await fetch(`/api/conversations/${selectedId}`);
      if (!res.ok || !active) return;
      const data = await res.json();
      setSelected(data.conversation);
      setMessages(data.messages);
    }
    load();
    const interval = setInterval(load, 3000);
    return () => { active = false; clearInterval(interval); };
  }, [selectedId]);

  // Scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!draft.trim() || !selectedId) return;
    setSending(true);
    await fetch(`/api/conversations/${selectedId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: draft.trim() }),
    });
    setDraft("");
    setSending(false);
    const res = await fetch(`/api/conversations/${selectedId}`);
    if (res.ok) {
      const data = await res.json();
      setSelected(data.conversation);
      setMessages(data.messages);
    }
  }

  async function updateStatus(status: string) {
    if (!selectedId) return;
    await fetch(`/api/conversations/${selectedId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const res = await fetch(`/api/conversations/${selectedId}`);
    if (res.ok) {
      const data = await res.json();
      setSelected(data.conversation);
    }
  }

  function closeChat() {
    setSelectedId(null);
    setSelected(null);
    setMessages([]);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          OVERLAY DE CHAT — position:fixed directo al viewport.
          No depende de ningún padre. Siempre ocupa exactamente la
          pantalla visible. Se superpone sobre el sidebar y la lista.
         ───────────────────────────────────────────────────────────── */}
      {selectedId && selected && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            flexDirection: "column",
          }}
          className="bg-fondo dark:bg-[#2D2D2D]"
        >
          {/* Cabecera del chat */}
          <div className="shrink-0 flex items-center justify-between gap-2 p-3 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#1A1A1A]">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={closeChat}
                className="shrink-0 text-negro dark:text-fondo text-lg px-1"
                aria-label="Volver"
              >
                ←
              </button>
              <div className="min-w-0">
                <p className="font-medium text-negro dark:text-fondo truncate text-sm">
                  {selected.metadata?.country ?? "Desconocido"}
                </p>
                <p className="text-xs text-secondary truncate">
                  {STATUS_LABEL[selected.status] ?? selected.status}
                </p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => updateStatus("bot")}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 text-negro dark:text-fondo hover:bg-black/10"
              >
                Al bot
              </button>
              <button
                onClick={() => updateStatus("closed")}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 text-negro dark:text-fondo hover:bg-black/10"
              >
                Cerrar
              </button>
            </div>
          </div>

          {/* Mensajes — el spacer empuja los mensajes al fondo, como WhatsApp */}
          <div style={{ flex: 1, overflowY: "auto" }} className="p-4 flex flex-col gap-3">
            <div style={{ flex: 1 }} />
            {messages.map((m) => (
              <div
                key={m.id}
                className={
                  "max-w-[75%] rounded-2xl px-4 py-2 text-sm " +
                  (m.role === "user"
                    ? "self-start bg-black/10 dark:bg-white/10 text-negro dark:text-fondo"
                    : m.role === "human_agent"
                    ? "self-end bg-primary text-white"
                    : "self-end bg-terciari text-negro")
                }
              >
                <p className="text-[10px] opacity-70 mb-0.5">
                  {m.role === "user" ? "Cliente" : m.role === "human_agent" ? "Tú" : "Bot"}
                </p>
                {m.content}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input — pegado al fondo del overlay (que es el fondo de la pantalla) */}
          <div className="shrink-0 p-3 border-t border-black/10 dark:border-white/10 flex gap-2 bg-white dark:bg-[#1A1A1A]">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Escribe como agente humano..."
              className="flex-1 rounded-lg bg-fondo dark:bg-[#2D2D2D] border border-black/10 dark:border-white/10 px-4 py-2 text-sm text-negro dark:text-fondo placeholder:text-secondary outline-none focus:border-primary"
            />
            <button
              onClick={handleSend}
              disabled={sending || !draft.trim()}
              className="px-4 py-2 rounded-lg bg-primary hover:bg-hover text-white text-sm disabled:opacity-50"
            >
              Enviar
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          LISTA DE CONVERSACIONES (siempre visible, scrollable)
         ───────────────────────────────────────────────────────────── */}
      <div className="w-full">
        <div className="flex items-baseline justify-between mb-4">
          <h1 className="text-xl font-semibold text-negro dark:text-fondo">Conversaciones</h1>
          <span className="text-secondary text-sm">{total} abiertas</span>
        </div>

        <div className="flex flex-col gap-2">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              style={{
                borderLeftColor: c.status === "waiting_human" ? "#F7A36B" : "#6BAEC9",
                borderLeftWidth: 4,
              }}
              className="text-left rounded-lg p-3 border border-black/10 dark:border-white/5 bg-white dark:bg-[#1A1A1A] shadow-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <p className="text-sm font-medium text-negro dark:text-fondo">
                {c.metadata?.country ?? "Desconocido"}
              </p>
              <p className="text-xs text-secondary">
                {STATUS_LABEL[c.status] ?? c.status} · {timeAgo(c.updated_at)}
              </p>
            </button>
          ))}
          {conversations.length === 0 && (
            <p className="text-secondary text-sm">No hay conversaciones abiertas.</p>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 mt-2 border-t border-black/10 dark:border-white/10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-sm px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 text-negro dark:text-fondo hover:bg-black/10 disabled:opacity-40"
            >
              ← Ant.
            </button>
            <span className="text-xs text-secondary">{page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="text-sm px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 text-negro dark:text-fondo hover:bg-black/10 disabled:opacity-40"
            >
              Sig. →
            </button>
          </div>
        )}
      </div>
    </>
  );
}
