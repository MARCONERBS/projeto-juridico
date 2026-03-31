"use client";

import { Bell, Search, User, LogOut, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";

export function Header() {
  const { user, profile, logout } = useAuth();
  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-8 dark:border-zinc-800 dark:bg-black">
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="md:hidden flex items-center bg-indigo-50 dark:bg-indigo-900/20 p-1.5 rounded-lg">
           <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          CORE / Início
        </h2>
      </div>


      <div className="flex items-center gap-3 sm:gap-6">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Procurar processos..."
            className="h-10 w-64 rounded-full border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-indigo-400"
          />
        </div>

        <button className="relative rounded-full p-2 text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-black"></span>
        </button>

        <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800" />

        <div className="flex items-center gap-1 sm:gap-3 rounded-full hover:bg-zinc-50 p-1 dark:border-zinc-800 dark:hover:bg-zinc-900 group transition-all">
          <div className="flex items-center justify-center gap-1 sm:gap-2 px-1 sm:px-2 border-r focus-within:ring-zinc-50 border-zinc-200 dark:border-zinc-800 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <User className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline max-w-[120px] truncate">{user?.email || "Visitante"}</span>
            {profile?.role === "admin" && <span className="ml-1 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded uppercase font-bold dark:bg-amber-900/50 dark:text-amber-400">Admin</span>}
          </div>
          <button onClick={logout} className="rounded-full p-2 text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 dark:hover:text-red-400 transition-colors" title="Sair da Conta">
             <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
