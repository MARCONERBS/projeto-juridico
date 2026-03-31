"use client";

import { useState } from "react";
import { FileText, Copy, CheckCircle, Download, History } from "lucide-react";
import { UploadZone } from "@/components/upload-zone";

export default function UploadPage() {
  const [extractedData, setExtractedData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

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
          Novo Documento
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Arraste e solte seu arquivo aqui para iniciar a extração de texto.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-1">
        <div className="space-y-4">
          <UploadZone onExtractionComplete={(data) => setExtractedData(data)} />
        </div>

        {extractedData && !extractedData.isBackground && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between gap-4 rounded-t-2xl border border-b-0 border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-black">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-indigo-600" />
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                    {extractedData.filename}
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

        {extractedData && extractedData.isBackground && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-4 rounded-2xl border border-indigo-200 bg-indigo-50/50 p-6 dark:border-indigo-900/30 dark:bg-indigo-900/10">
            <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-400">
              Upload e Processamento em Segundo Plano
            </h3>
            <p className="mt-2 text-indigo-700 dark:text-indigo-300">
              O arquivo <strong>{extractedData.filename}</strong> foi enviado com sucesso! 
              O sistema está processando as páginas e extraindo as informações usando Inteligência Artificial.
            </p>
            <p className="mt-2 text-sm font-medium text-indigo-600 dark:text-indigo-400">
              Você não precisa aguardar nesta tela. A extração vai continuar nos bastidores. 
              basta acessar o menu <strong>Meus Arquivos</strong> daqui a alguns instantes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
