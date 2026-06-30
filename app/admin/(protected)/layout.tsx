import { ReactNode } from "react";
import { signOut } from "@/auth";
import Sidebar from "@/components/admin/Sidebar";

async function logout() {
  "use server";
  await signOut({ redirectTo: "/admin/login" });
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-fondo dark:bg-[#2D2D2D] text-negro dark:text-fondo font-poppins">
      <Sidebar logoutAction={logout} />
      <main className="flex-1 overflow-y-auto p-4 pt-20 md:p-6 md:pt-6">{children}</main>
    </div>
  );
}
