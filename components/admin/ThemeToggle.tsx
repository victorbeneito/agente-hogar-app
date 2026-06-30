"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
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

  return (
    <button
      onClick={toggle}
      className="mx-3 mb-1 text-sm text-secondary hover:text-negro dark:hover:text-fondo px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left"
    >
      {dark ? "☀️ Modo claro" : "🌙 Modo oscuro"}
    </button>
  );
}
