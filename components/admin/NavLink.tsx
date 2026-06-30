"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      onClick={onClick}
      className={
        "px-3 py-2 rounded-lg text-sm transition-colors border-l-4 " +
        (active
          ? "bg-white/5 text-fondo border-primary"
          : "text-secondary border-transparent hover:bg-white/5 hover:text-fondo")
      }
    >
      {label}
    </Link>
  );
}
