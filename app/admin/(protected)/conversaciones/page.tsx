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
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [page]);

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
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [selectedId]);

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

  return (
    <div className="flex gap-4 flex-1 min-h-0">
      <div className={(selectedId ? "hidden md:flex" : "flex") + " w-full md:w-80 shrink-0 flex-col"}>
        <div className="flex items-baseline justify-between mb-4">
          <h1 className="text-xl font-semibold">Conversaciones</h1>
          <span className="text-secondary text-sm">{total} abiertas</span>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-2">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={
                "text-left rounded-lg p-3 border-l-4 transition-colors " +
                (c.status === "waiting_human" ? "border-accent" : "border-primary") +
                " " +
                (selectedId === c.id
                  ? "bg-black/10 dark:bg-white/10"
                  : "bg-white dark:bg-[#1A1A1A] border border-black/10 dark:border-white/5 shadow-sm dark:shadow-none hover:bg-black/5 dark:hover:bg-white/5")
              }
            >
              <p className="text-sm font-medium">{c.metadata?.country ?? "Desconocido"}</p>
              <p className="text-xs text-secondary">
                {STATUS_LABEL[c.status] ?? c.status} · {timeAgo(c.updated_at)}
              </p>
            </button>
          ))}
          {conversations.length === 0 && <p className="text-secondary text-sm">No hay conversaciones abiertas.</p>}
        </div>

        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between pt-3 mt-2 border-t border-black/10 dark:border-white/10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-sm px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Anterior
            </button>
            <span className="text-xs text-secondary">
              {page} / {Math.ceil(total / PAGE_SIZE)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(total / PAGE_SIZE)}
              className="text-sm px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>

      <div
        className={
          (selectedId ? "flex" : "hidden md:flex") +
          " flex-1 bg-white dark:bg-[#1A1A1A] border border-black/10 dark:border-white/5 rounded-xl flex-col overflow-hidden shadow-sm dark:shadow-none"
        }
      >
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-secondary">
            Selecciona una conversación
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  onClick={() => setSelectedId(null)}
                  aria-label="Volver a la lista"
                  className="md:hidden shrink-0 text-secondary hover:text-negro dark:hover:text-fondo p-1"
                >
                  ←
                </button>
                <div className="min-w-0">
                  <p className="font-medium truncate">{selected.metadata?.country ?? "Desconocido"}</p>
                  <p className="text-xs text-secondary truncate">
                    <code>{selected.session_id}</code> · {STATUS_LABEL[selected.status] ?? selected.status}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => updateStatus("bot")}
                  className="text-xs px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10"
                >
                  Devolver al bot
                </button>
                <button
                  onClick={() => updateStatus("closed")}
                  className="text-xs px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10"
                >
                  Cerrar
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={
                    "max-w-[75%] rounded-2xl px-4 py-2 text-sm " +
                    (m.role === "user"
                      ? "self-start bg-black/10 dark:bg-white/10"
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

            <div className="p-3 border-t border-black/10 dark:border-white/10 flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Escribe como agente humano..."
                className="flex-1 rounded-lg bg-fondo dark:bg-[#2D2D2D] border border-black/10 dark:border-white/10 px-4 py-2 text-sm outline-none focus:border-primary"
              />
              <button
                onClick={handleSend}
                disabled={sending || !draft.trim()}
                className="px-4 py-2 rounded-lg bg-primary hover:bg-hover text-white text-sm disabled:opacity-50"
              >
                Enviar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
