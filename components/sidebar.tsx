"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  FileText,
  Upload,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { profile, logout } = useAuth();

  const menuItems = [
    { icon: Upload, label: "Novo Documento", href: "/upload" },
    { icon: FileText, label: "Meus Arquivos", href: "/history" },
  ];

  if (profile?.role === "admin") {
    menuItems.unshift({ icon: FileText, label: "Resumo Global", href: "/" });
    menuItems.push({ icon: Users, label: "Cadastrar Equipe", href: "/team" });
    menuItems.push({ icon: Settings, label: "Configurações", href: "/settings" });
  }

  return (
    <aside
      className={cn(
        "relative hidden md:flex flex-col border-r border-zinc-200 bg-white transition-all duration-300 dark:border-zinc-800 dark:bg-black",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex h-16 items-center border-b border-zinc-100 px-6 dark:border-zinc-900">
        <FileText className="h-8 w-8 text-indigo-600 dark:text-indigo-400 shrink-0" />
        {!isCollapsed && (
          <span className="ml-3 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            CORE
          </span>
        )}
      </div>


      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0 transition-transform group-hover:scale-110", isCollapsed ? "mx-auto" : "mr-3")} />
              {!isCollapsed && <span>{item.label}</span>}
              
              {isCollapsed && (
                <div className="absolute left-16 z-50 hidden rounded-md bg-zinc-900 px-2 py-1 text-xs text-white group-hover:block dark:bg-zinc-50 dark:text-zinc-900">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-100 p-4 dark:border-zinc-900">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex w-full items-center justify-center rounded-lg border border-zinc-200 py-2 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>
    </aside>
  );
}
