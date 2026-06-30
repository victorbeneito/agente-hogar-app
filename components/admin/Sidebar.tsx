"use client";

import { useState } from "react";
import NavLink from "./NavLink";
import InstallPwa from "./InstallPwa";

const NAV_ITEMS = [
  { href: "/admin/visitantes", label: "👥 Visitantes en vivo" },
  { href: "/admin/conversaciones", label: "💬 Conversaciones" },
  { href: "/admin/historial", label: "🕓 Historial" },
  { href: "/admin/conocimiento", label: "📚 Base de conocimiento" },
  { href: "/admin/estadisticas", label: "📊 Estadísticas" },
];

export default function Sidebar({ logoutAction }: { logoutAction: () => Promise<void> }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="md:hidden fixed top-0 inset-x-0 h-14 bg-[#1A1A1A] border-b border-white/10 flex items-center justify-between px-4 z-30">
        <p className="font-semibold text-fondo text-sm">El Hogar de Tus Sueños</p>
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          className="text-fondo p-2 -mr-2"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={
          "fixed md:static top-0 left-0 h-full w-64 md:w-60 bg-[#1A1A1A] flex flex-col shrink-0 z-50 transition-transform duration-200 " +
          (open ? "translate-x-0" : "-translate-x-full md:translate-x-0")
        }
      >
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <p className="font-semibold text-fondo leading-tight">El Hogar de Tus Sueños</p>
            <p className="text-xs text-secondary">Panel admin</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
            className="md:hidden text-secondary hover:text-fondo p-1"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} onClick={() => setOpen(false)} />
          ))}
        </nav>

        <InstallPwa />

        <form action={logoutAction} className="p-3 border-t border-white/10">
          <button
            type="submit"
            className="w-full text-left text-sm text-secondary hover:text-fondo px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            Cerrar sesión
          </button>
        </form>
      </aside>
    </>
  );
}
