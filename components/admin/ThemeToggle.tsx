"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle({ inline = false }: { inline?: boolean }) {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("ehts_theme", next ? "dark" : "light");
  }

  if (inline) {
    return (
      <button
        onClick={toggle}
        aria-label={dark ? "Activar modo claro" : "Activar modo oscuro"}
        className="text-secondary hover:text-negro dark:hover:text-fondo p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        {dark ? "☀️" : "🌙"}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className="mx-3 mb-1 text-sm text-secondary hover:text-negro dark:hover:text-fondo px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left"
    >
      {dark ? "☀️ Modo claro" : "🌙 Modo oscuro"}
    </button>
  );
}
