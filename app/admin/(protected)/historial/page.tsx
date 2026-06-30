"use client";

import { useEffect, useState } from "react";

interface ConversationSummary {
  id: string;
  session_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  metadata: { country?: string } | null;
}

interface Message {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" });
}

export default function HistorialPage() {
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  async function search() {
    setLoading(true);
    const params = new URLSearchParams({ status: "closed" });
    if (q) params.set("q", q);
    if (from) params.set("from", new Date(from).toISOString());
    if (to) params.set("to", new Date(to).toISOString());

    const res = await fetch(`/api/conversations?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setConversations(data.conversations);
    }
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    fetch(`/api/conversations/${selectedId}`)
      .then((r) => r.json())
      .then((d) => setMessages(d.messages));
  }, [selectedId]);

  return (
    <div className="flex-1 overflow-y-auto">
      <h1 className="text-xl font-semibold mb-1">Historial</h1>
      <p className="text-secondary text-sm mb-4">Conversaciones cerradas</p>

      <div className="flex flex-wrap gap-2 mb-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por contenido..."
          className="flex-1 min-w-[200px] rounded-lg bg-white dark:bg-[#1A1A1A] border border-black/10 dark:border-white/10 px-4 py-2 text-sm outline-none focus:border-primary"
        />
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="rounded-lg bg-white dark:bg-[#1A1A1A] border border-black/10 dark:border-white/10 px-4 py-2 text-sm outline-none focus:border-primary"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="rounded-lg bg-white dark:bg-[#1A1A1A] border border-black/10 dark:border-white/10 px-4 py-2 text-sm outline-none focus:border-primary"
        />
        <button
          onClick={search}
          className="px-4 py-2 rounded-lg bg-primary hover:bg-hover text-white text-sm"
        >
          Buscar
        </button>
      </div>

      <div className="flex gap-4">
        <div
          className={
            (selectedId ? "hidden md:flex" : "flex") + " w-full md:w-80 shrink-0 flex-col gap-2"
          }
        >
          {loading && <p className="text-secondary text-sm">Buscando...</p>}
          {!loading && conversations.length === 0 && (
            <p className="text-secondary text-sm">Sin resultados.</p>
          )}
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={
                "text-left rounded-lg p-3 transition-colors " +
                (selectedId === c.id
                  ? "bg-black/10 dark:bg-white/10"
                  : "bg-white dark:bg-[#1A1A1A] border border-black/10 dark:border-white/5 shadow-sm dark:shadow-none hover:bg-black/5 dark:hover:bg-white/5")
              }
            >
              <p className="text-sm font-medium">{c.metadata?.country ?? "Desconocido"}</p>
              <p className="text-xs text-secondary">{formatDate(c.created_at)}</p>
            </button>
          ))}
        </div>

        <div
          className={
            (selectedId ? "block" : "hidden md:block") +
            " flex-1 bg-white dark:bg-[#1A1A1A] border border-black/10 dark:border-white/5 rounded-xl p-4 min-h-[300px] shadow-sm dark:shadow-none"
          }
        >
          {!selectedId ? (
            <p className="text-secondary">Selecciona una conversación del historial</p>
          ) : (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setSelectedId(null)}
                className="md:hidden self-start text-secondary hover:text-negro dark:hover:text-fondo text-sm mb-1"
              >
                ← Volver al historial
              </button>
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
                    {m.role === "user" ? "Cliente" : m.role === "human_agent" ? "Agente" : "Bot"}
                  </p>
                  {m.content}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
