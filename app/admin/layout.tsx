import type { Metadata, Viewport } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  appleWebApp: {
    capable: true,
    title: "Hogar Admin",
    statusBarStyle: "black-translucent",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1A1A1A",
  // Android: al abrir el teclado se redimensiona el contenido en vez de desplazarlo
  interactiveWidget: "resizes-content",
};

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var saved = localStorage.getItem("ehts_theme");
    var dark = saved ? saved === "dark" : true;
    document.documentElement.classList.toggle("dark", dark);
  } catch (e) {}
})();
`;

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      {children}
    </>
  );
}
