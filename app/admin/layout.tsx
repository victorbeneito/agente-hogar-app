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
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return children;
}
