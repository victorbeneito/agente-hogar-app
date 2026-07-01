"use client";

import { useState } from "react";
import NavLink from "./NavLink";
import InstallPwa from "./InstallPwa";
import ThemeToggle from "./ThemeToggle";

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
      {/* Top bar — solo visible en móvil */}
      <div className="md:hidden fixed top-0 inset-x-0 h-14 bg-white dark:bg-[#1A1A1A] border-b border-black/10 dark:border-white/10 flex items-center justify-between px-4 z-30">
        <p className="font-semibold text-negro dark:text-fondo text-sm">El Hogar de Tus Sueños</p>
        <ThemeToggle inline />
      </div>

      {/* Overlay para cerrar sidebar en desktop (si se abre) */}
      {open && (
        <div
          className="hidden md:block fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — solo visible en desktop */}
      <aside className="hidden md:flex md:static top-0 left-0 h-full w-60 bg-white dark:bg-[#1A1A1A] flex-col shrink-0 z-50">
        <div className="p-5 border-b border-black/10 dark:border-white/10">
          <p className="font-semibold text-negro dark:text-fondo leading-tight">El Hogar de Tus Sueños</p>
          <p className="text-xs text-secondary">Panel admin</p>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} onClick={() => setOpen(false)} />
          ))}
        </nav>

        <ThemeToggle />
        <InstallPwa />

        <form action={logoutAction} className="p-3 border-t border-black/10 dark:border-white/10">
          <button
            type="submit"
            className="w-full text-left text-sm text-secondary hover:text-negro dark:hover:text-fondo px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            Cerrar sesión
          </button>
        </form>
      </aside>
    </>
  );
}
