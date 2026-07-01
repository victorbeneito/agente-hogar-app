"use client";

import { useEffect } from "react";

// Impide que el documento (body/html) haga scroll mientras el panel admin está abierto.
// El layout usa fixed inset-0, así que todo el scroll debe ocurrir dentro de los paneles,
// no en el documento.
export default function DisableScroll() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = "";
      body.style.overflow = "";
    };
  }, []);
  return null;
}
