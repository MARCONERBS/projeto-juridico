"use client";

import { useState, useEffect } from "react";
import { 
  FileText, 
  History, 
  Zap,
  Copy,
  CheckCircle,
  Clock,
  Download,
  User
} from "lucide-react";
import { StatsCard } from "@/components/stats-card";
import { UploadZone } from "@/components/upload-zone";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";

export default function Home() {
  const { profile } = useAuth();
  const [extractedData, setExtractedData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
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

  const copyToClipboard = () => {
    if (extractedData?.text) {
      navigator.clipboard.writeText(extractedData.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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

      <div className="grid gap-8 lg:grid-cols-1">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Fazer Nova Extração
          </h2>
          <UploadZone onExtractionComplete={(data) => {
            setExtractedData(data);
            // Atualizar o histórico ao enviar novo arquivo
            if (data?.id) {
               setHistory(prev => [{
                  id: data.id,
                  filename: data.filename,
                  created_at: new Date().toISOString(),
                  data_json: { numpages: data.numpages, text: data.text }
               }, ...prev].slice(0, 5));
            }
          }} />
        </div>

        {extractedData && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between gap-4 rounded-t-2xl border border-b-0 border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-black">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-indigo-600" />
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                    {extractedData.filename}
                    {extractedData.saved && <span className="ml-2 text-xs font-semibold text-emerald-500">(Salvo com sucesso no Banco)</span>}
                  </h3>
                  <p className="text-sm text-zinc-500">
                    {extractedData.numpages ? `${extractedData.numpages} páginas extraídas` : "Texto plano"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                >
                  {copied ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copiado!" : "Copiar Texto"}
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([extractedData.text], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `extração-${extractedData.filename}.txt`;
                    a.click();
                  }}
                  className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900"
                >
                  <Download className="h-4 w-4" />
                  Salvar .txt
                </button>
              </div>
            </div>
            <div className="rounded-b-2xl border border-zinc-200 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
              <pre className="max-h-[500px] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                {extractedData.text?.trim() 
                  ? extractedData.text 
                  : "Nenhum texto extraído. Isso geralmente ocorre se o PDF for uma imagem/documento escaneado sem texto selecionável."}
              </pre>
            </div>
          </div>
        )}
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
