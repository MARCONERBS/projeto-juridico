"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { useAuth } from "@/components/auth-provider";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const isLogin = pathname === "/login";

  // Se estiver na tela de login ou se não houver usuário logado (está sendo redirecionado), 
  // renderiza apenas o conteúdo sem o layout do painel.
  if (isLogin || !user || loading) {
    return <main className="flex-1 w-full flex flex-col">{children}</main>;
  }

  return (
    <>
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden pb-24 md:pb-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
      <MobileNav />
    </>
  );
}
