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
               <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                 <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-indigo-500 mt-0.5" />
                    <div>
                       <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{item.filename}</p>
                       <div className="flex flex-col gap-0.5 mt-1 text-xs text-zinc-500">
                         <span className="flex items-center gap-1">
                           <User className="h-3 w-3" />
                           {item.profiles?.email || item.data_json?.user_email || "Desconhecido"}
                         </span>
                         <span className="flex items-center gap-1">
                           <Clock className="h-3 w-3" />
                           {new Date(item.created_at).toLocaleString()}
                         </span>
                       </div>
                    </div>
                 </div>
                 <div className="text-xs text-zinc-500">
                    {item.data_json?.numpages ? `${item.data_json.numpages} pág.` : "Texto"}
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
