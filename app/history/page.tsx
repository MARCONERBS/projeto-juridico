"use client";

import { useEffect, useState } from "react";
import { FileText, Search, MoreVertical, Download, Loader2, User, CheckCircle, Calendar, Zap, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";

export default function HistoryPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      if (authLoading) return; // Aguarda o auth provider finalizar o carregamento

      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        let query = supabase
          .from("pdf_extractions")
          .select("*, profiles(email)")
          .order("created_at", { ascending: false });

        if (profile?.role === "user") {
          query = query.eq("user_id", user.id);
        }

        const { data, error } = await query;

        if (data) {
          setHistory(data);
        } else if (error) {
          console.error("Erro ao puxar histórico:", error);
        }
      } catch (err) {
        console.error("Erro inesperado:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchHistory();
  }, [user?.id, profile?.role, authLoading]);

  const handleDownload = (item: any) => {
    const text = item.data_json?.text || "Nenhum texto disponível.";
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `extração-${item.filename}.txt`;
    a.click();
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Meus Arquivos
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Histórico das extrações salvas no sistema.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-black">
        <div className="flex items-center justify-between border-b border-zinc-100 p-6 dark:border-zinc-900">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Pesquisar nos arquivos..."
              className="h-10 w-full rounded-full border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900"
            />
          </div>
        </div>

        {/* Visualização em Cards para Mobile */}
        <div className="md:hidden divide-y divide-zinc-100 dark:divide-zinc-900">
          {loading && (
            <div className="py-12 text-center text-sm text-zinc-500">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-zinc-400 mb-2" />
              Carregando documentos...
            </div>
          )}
          {!loading && history.length === 0 && (
            <div className="py-12 text-center text-sm text-zinc-500 px-6">
              Nenhuma extração encontrada no sistema ainda.
            </div>
          )}
          {!loading && history.map((item) => (
            <div key={item.id} className="p-5 space-y-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate" title={item.filename}>
                    {item.filename}
                  </h3>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold mt-0.5">
                    ID: {item.id.split('-')[0]}...
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pb-2">
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-400 uppercase font-medium block">Emissão</span>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                    <Calendar className="h-3 w-3 opacity-50" />
                    {item.data_json?.data_emissao || item.data_json?.emissao || item.data_json?.data_emissão || "--"}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-400 uppercase font-medium block">Vencimento</span>
                  <div className={`flex items-center gap-1.5 text-xs font-medium ${item.data_json?.data_vencimento ? 'text-amber-600' : 'text-zinc-500'}`}>
                    <Zap className={`h-3 w-3 ${item.data_json?.data_vencimento ? 'opacity-100' : 'opacity-50'}`} />
                    {item.data_json?.data_vencimento || item.data_json?.data_validade || item.data_json?.validade || item.data_json?.vencimento || "--"}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-400 uppercase font-medium block">Extraído em</span>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <span className="truncate">{new Date(item.created_at).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-400 uppercase font-medium block">Páginas</span>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    {item.data_json?.numpages || "1"}
                  </div>
                </div>
              </div>

              {profile?.role === "admin" && (
                <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-3 flex items-center justify-between border border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500 min-w-0">
                    <User className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{item.profiles?.email || item.data_json?.user_email || "Sistema"}</span>
                  </div>
                  {item.data_json?.notification_sent_at && (
                    <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle className="h-3 w-3" />
                      <span>Notificado</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                {item.data_json?.file_url && (
                  <a
                    href={item.data_json.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 active:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Ver PDF</span>
                  </a>
                )}
                <button
                  onClick={() => handleDownload(item)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 active:transform active:scale-[0.98] transition-all dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  <Download className="h-4 w-4" />
                  <span>Baixar TXT</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Visualização em Tabela para Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-900 dark:bg-zinc-900/50 dark:text-zinc-400">
                <th className="px-6 py-3">Documento</th>
                <th className="px-6 py-3">Data de Extração</th>
                <th className="px-6 py-3">Emissão</th>
                <th className="px-6 py-3">Vencimento</th>
                <th className="px-6 py-3">Páginas</th>
                {profile?.role === "admin" && <th className="px-6 py-3">Vendedor Extração</th>}
                {profile?.role === "admin" && <th className="px-6 py-3">Alerta de Vencimento</th>}
                <th className="px-6 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {loading && (
                <tr>
                  <td colSpan={profile?.role === "admin" ? 8 : 6} className="py-8 text-center text-sm text-zinc-500">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-zinc-400" />
                    Carregando do banco de dados...
                  </td>
                </tr>
              )}
              {!loading && history.length === 0 && (
                <tr>
                  <td colSpan={profile?.role === "admin" ? 8 : 6} className="py-8 text-center text-sm text-zinc-500">
                    Nenhuma extração encontrada no sistema ainda.
                  </td>
                </tr>
              )}
              {!loading &&
                history.map((item) => (
                  <tr key={item.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                          <FileText className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate max-w-[200px]" title={item.filename}>
                          {item.filename}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                      {new Date(item.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-center gap-1.5">
                         <Calendar className="h-3.5 w-3.5 opacity-50" />
                         {item.data_json?.data_emissao || item.data_json?.emissao || item.data_json?.data_emissão ? (item.data_json.data_emissao || item.data_json.emissao || item.data_json.data_emissão) : <span className="text-zinc-400 italic">--</span>}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-center gap-1.5">
                         <Zap className={`h-3.5 w-3.5 ${item.data_json?.data_vencimento ? 'text-amber-500' : 'opacity-30'}`} />
                         {item.data_json?.data_vencimento || item.data_json?.data_validade || item.data_json?.vencimento || item.data_json?.validade ? (item.data_json.data_vencimento || item.data_json.data_validade || item.data_json.vencimento || item.data_json.validade) : <span className="text-zinc-400 italic">--</span>}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                      {item.data_json?.numpages ? `${item.data_json.numpages} pág.` : "1"}
                    </td>
                    {profile?.role === "admin" && (
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                        <div className="flex items-center gap-1 min-w-[120px]">
                          <User className="h-4 w-4 text-zinc-400" />
                          <span className="truncate">{item.profiles?.email || item.data_json?.user_email || "Sistema"}</span>
                        </div>
                      </td>
                    )}
                    {profile?.role === "admin" && (
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-500">
                        {item.data_json?.notification_sent_at ? (
                          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle className="h-3 w-3" />
                            {new Date(item.data_json.notification_sent_at).toLocaleDateString("pt-BR")}
                          </div>
                        ) : (
                          <span className="text-zinc-400 italic">Não enviado</span>
                        )}
                      </td>
                    )}
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.data_json?.file_url && (
                          <a
                            href={item.data_json.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-xl border border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
                            title="Visualizar PDF original"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDownload(item)}
                          className="rounded-xl border border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
                          title="Baixar texto extraído (.txt)"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
