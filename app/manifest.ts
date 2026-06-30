import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "El Hogar de Tus Sueños - Panel Admin",
    short_name: "Hogar Admin",
    description: "Panel de administración del agente IA de El Hogar de Tus Sueños",
    start_url: "/admin",
    scope: "/admin",
    display: "standalone",
    background_color: "#1A1A1A",
    theme_color: "#6BAEC9",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
