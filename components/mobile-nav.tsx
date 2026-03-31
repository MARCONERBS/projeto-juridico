"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Upload, FileText, LayoutDashboard, Users, Settings } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  const { profile } = useAuth();

  const menuItems = [
    { icon: Upload, label: "Novo", href: "/upload" },
    { icon: FileText, label: "Arquivos", href: "/history" },
  ];

  if (profile?.role === "admin") {
    menuItems.unshift({ icon: LayoutDashboard, label: "Início", href: "/" });
    menuItems.push({ icon: Settings, label: "Ajustes", href: "/settings" });
  }

  return (
    <div 
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-black/80"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
    >
      <nav className="flex items-center justify-around px-2 pb-2 pt-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 rounded-xl px-3 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-12 items-center justify-center rounded-full transition-colors",
                  isActive ? "bg-indigo-100 dark:bg-indigo-900/40" : ""
                )}
              >
                <item.icon className="h-5 w-5" />
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
