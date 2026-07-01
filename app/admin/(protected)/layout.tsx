import { ReactNode } from "react";
import { signOut } from "@/auth";
import Sidebar from "@/components/admin/Sidebar";
import BottomNav from "@/components/admin/BottomNav";

async function logout() {
  "use server";
  await signOut({ redirectTo: "/admin/login" });
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 flex bg-fondo dark:bg-[#2D2D2D] text-negro dark:text-fondo font-poppins overflow-hidden">
      <Sidebar logoutAction={logout} />
      {/* pt-14 en móvil para el top bar, pb-16 para la barra inferior */}
      <main className="flex-1 flex flex-col overflow-hidden p-4 pt-[calc(3.5rem+1rem)] pb-20 md:p-6 md:pt-6 md:pb-6">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
