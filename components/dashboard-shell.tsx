"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  if (isLogin) {
    return <main className="flex-1 w-full">{children}</main>;
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
