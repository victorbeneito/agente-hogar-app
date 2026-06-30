"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", { password, redirect: false });

    setLoading(false);

    if (res?.error) {
      setError("Contraseña incorrecta");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-fondo dark:bg-[#1A1A1A] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white dark:bg-[#2D2D2D] rounded-2xl p-8 shadow-xl"
      >
        <h1 className="text-negro dark:text-fondo text-2xl font-semibold mb-1">El Hogar de Tus Sueños</h1>
        <p className="text-secondary text-sm mb-6">Panel de administración</p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          autoFocus
          className="w-full rounded-lg bg-fondo dark:bg-[#1A1A1A] border border-secondary text-negro dark:text-fondo px-4 py-3 mb-4 outline-none focus:border-primary"
        />

        {error && <p className="text-accent text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-hover transition-colors text-white font-medium rounded-lg py-3 disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
