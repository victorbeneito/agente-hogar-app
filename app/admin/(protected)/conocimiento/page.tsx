"use client";

import { useEffect, useState } from "react";

interface Doc {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = ["producto", "envio", "devolucion", "faq", "empresa"];

const EMPTY_FORM = { title: "", content: "", category: "producto" };

export default function ConocimientoPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/knowledge");
    if (res.ok) {
      const data = await res.json();
      setDocs(data.documents);
    }
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  function startEdit(doc: Doc) {
    setEditingId(doc.id);
    setForm({ title: doc.title, content: doc.content, category: doc.category });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);

    if (editingId) {
      await fetch(`/api/knowledge/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }

    setSaving(false);
    cancelEdit();
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este documento de la base de conocimiento?")) return;
    await fetch(`/api/knowledge/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Base de conocimiento</h1>
      <p className="text-secondary text-sm mb-6">Documentos que usa la IA para responder (RAG)</p>

      <div className="bg-[#1A1A1A] rounded-xl p-4 mb-6">
        <p className="text-sm font-medium mb-3">{editingId ? "Editar documento" : "Nuevo documento"}</p>
        <div className="flex flex-col gap-3">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Título"
            className="rounded-lg bg-[#2D2D2D] border border-white/10 px-4 py-2 text-sm outline-none focus:border-primary"
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="rounded-lg bg-[#2D2D2D] border border-white/10 px-4 py-2 text-sm outline-none focus:border-primary"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Contenido"
            rows={4}
            className="rounded-lg bg-[#2D2D2D] border border-white/10 px-4 py-2 text-sm outline-none focus:border-primary resize-y"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-primary hover:bg-hover text-white text-sm disabled:opacity-50"
            >
              {saving ? "Guardando..." : editingId ? "Guardar cambios" : "Añadir documento"}
            </button>
            {editingId && (
              <button onClick={cancelEdit} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm">
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-secondary">Cargando...</p>
      ) : (
        <div className="grid gap-2">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="bg-[#1A1A1A] rounded-xl p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4"
            >
              <div className="min-w-0">
                <p className="font-medium text-sm">
                  {doc.title} <span className="text-secondary text-xs">({doc.category})</span>
                </p>
                <p className="text-secondary text-xs mt-1 line-clamp-2">{doc.content}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => startEdit(doc)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-accent/20 text-accent hover:bg-accent/30"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
