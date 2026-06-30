"use client";

import { useEffect, useState } from "react";

interface Visitor {
  id: string;
  session_id: string;
  country: string | null;
  country_code: string | null;
  city: string | null;
  device: string | null;
  browser: string | null;
  current_page: string | null;
  first_seen: string;
  last_seen: string;
  has_chatted: boolean;
}

function flag(countryCode: string | null) {
  if (!countryCode || countryCode.length !== 2) return "🌍";
  return String.fromCodePoint(...countryCode.toUpperCase().split("").map((c) => 127397 + c.charCodeAt(0)));
}

function timeOnSite(firstSeen: string) {
  const minutes = Math.round((Date.now() - new Date(firstSeen).getTime()) / 60000);
  if (minutes < 1) return "menos de 1 min";
  if (minutes < 60) return `${minutes} min`;
  return `${Math.round(minutes / 60)} h`;
}

export default function VisitantesPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      const res = await fetch("/api/visitors");
      if (!res.ok || !active) return;
      const data = await res.json();
      setVisitors(data.visitors);
      setLoading(false);
    }

    load();
    const interval = setInterval(load, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Visitantes en vivo</h1>
      <p className="text-secondary text-sm mb-6">Activos en los últimos 5 minutos · se actualiza cada 5s</p>

      {loading ? (
        <p className="text-secondary">Cargando...</p>
      ) : visitors.length === 0 ? (
        <p className="text-secondary">No hay visitantes activos en este momento.</p>
      ) : (
        <div className="grid gap-3">
          {visitors.map((v) => (
            <div
              key={v.id}
              className="bg-[#1A1A1A] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl shrink-0">{flag(v.country_code)}</span>
                <div className="min-w-0">
                  <p className="font-medium truncate">
                    {v.country ?? "Desconocido"}
                    {v.city ? ` · ${v.city}` : ""}
                  </p>
                  <p className="text-secondary text-sm truncate">
                    {v.current_page ?? "?"} · {v.device ?? "?"} ({v.browser ?? "?"})
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right text-sm text-secondary shrink-0">
                <p>{timeOnSite(v.first_seen)} en el sitio</p>
                {v.has_chatted && <p className="text-primary">💬 Ha chateado</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
