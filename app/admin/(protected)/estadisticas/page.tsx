"use client";

import { useEffect, useState } from "react";

interface Stats {
  visitorsToday: number;
  chatsIniciados: number;
  esperandoHumano: number;
  resueltosPorBot: number;
  pctResueltos: number;
}

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-terciari text-negro rounded-xl p-5">
      <p className="text-3xl font-semibold">{value}</p>
      <p className="text-sm opacity-80 mt-1">{label}</p>
    </div>
  );
}

export default function EstadisticasPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      const res = await fetch("/api/stats");
      if (!res.ok || !active) return;
      setStats(await res.json());
    }
    load();
    const interval = setInterval(load, 30000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex-1 overflow-y-auto">
      <h1 className="text-xl font-semibold mb-1">Estadísticas</h1>
      <p className="text-secondary text-sm mb-6">Resumen del día de hoy</p>

      {!stats ? (
        <p className="text-secondary">Cargando...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card label="Visitantes hoy" value={stats.visitorsToday} />
          <Card label="Chats iniciados" value={stats.chatsIniciados} />
          <Card label="Esperando atención humana" value={stats.esperandoHumano} />
          <Card label="Resueltos por el bot" value={`${stats.resueltosPorBot} (${stats.pctResueltos}%)`} />
        </div>
      )}
    </div>
  );
}
