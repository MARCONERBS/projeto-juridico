"use client";

import { useEffect } from "react";
import { useState } from "react";
import { 
  FileText, 
  History, 
  CheckCircle,
  Clock,
  User
} from "lucide-react";
import { StatsCard } from "@/components/stats-card";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";

export default function Home() {
  const { profile } = useAuth();
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      // Carrega todo o histórico global com a identidade do vendedor
      const { data } = await supabase
        .from("pdf_extractions")
        .select("*, profiles(email)")
        .order("created_at", { ascending: false })
        .limit(5);
      if (data) setHistory(data);
    }
    loadDashboard();
  }, []);


  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Painel de Extração
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Suba arquivos PDF ou texto para extrair seu conteúdo instantaneamente e salvá-lo no sistema.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Extrações Registradas"
          value={history.length > 0 ? history.length.toString() : "0"}
          icon={FileText}
          color="indigo"
        />
        <StatsCard
          title="Status do Sistema"
          value="Online"
          icon={CheckCircle}
          color="emerald"
        />
        <StatsCard
          title="Armazenamento DB"
          value="Ativo"
          icon={History}
          color="amber"
        />
      </div>



      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-black">
        <div className="flex items-center justify-between border-b border-zinc-100 p-6 dark:border-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Extrações Recentes (Últimas 5)
          </h2>
          <History className="h-5 w-5 text-zinc-400" />
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
          {history.length > 0 ? (
            history.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0 rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate" title={item.filename}>
                        {item.filename}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                        <span className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 opacity-70" />
                          <span className="truncate max-w-[120px] sm:max-w-none">
                            {item.profiles?.email || item.data_json?.user_email || "Desconhecido"}
                          </span>
                        </span>
                        <span className="flex items-center gap-1.5 border-l border-zinc-200 dark:border-zinc-800 pl-4 hidden sm:flex">
                          <Clock className="h-3.5 w-3.5 opacity-70" />
                          {new Date(item.created_at).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="flex items-center gap-1.5 sm:hidden">
                           <Clock className="h-3.5 w-3.5 opacity-70" />
                           {new Date(item.created_at).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-0 flex items-center justify-between sm:justify-end gap-3 sm:pl-4">
                    <div className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
                      {item.data_json?.numpages ? `${item.data_json.numpages} pág.` : "Texto"}
                    </div>
                  </div>
                </div>
            ))
          ) : (
            <div className="p-8 text-center text-sm text-zinc-500">
              Nenhuma extração recente encontrada.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
