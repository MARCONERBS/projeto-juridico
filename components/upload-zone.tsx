"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";

interface UploadZoneProps {
  onExtractionComplete: (data: any) => void;
}

export function UploadZone({ onExtractionComplete }: UploadZoneProps) {
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) validateAndUpload(droppedFile);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) validateAndUpload(selectedFile);
  };

  const validateAndUpload = async (file: File) => {
    setFile(file);
    setStatus("uploading");
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    if (user) {
      formData.append("userId", user.id);
      if (user.email) formData.append("userEmail", user.email);
    }
    
    const token = localStorage.getItem("gemini_api_key");
    if (token) {
      formData.append("geminiApiKey", token);
    }
    
    const webhook = localStorage.getItem("n8n_webhook_send");
    if (webhook) {
      formData.append("n8nWebhook", webhook);
    }

    try {
      // 1. Tentar extração local no navegador (Muito mais rápido e evita timeout do servidor)
      let extractedText = "";
      if (file.type === "application/pdf") {
        try {
          const pdfjsLib = await import("pdfjs-dist");
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
          
          const arrayBuffer = await file.arrayBuffer();
          const loadingTask = pdfjsLib.getDocument({
            data: arrayBuffer,
            useSystemFonts: true,
            disableFontFace: true,
          });
          const pdf = await loadingTask.promise;
          let fullText = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items
              .map((item: any) => item.str)
              .join(" ");
            fullText += pageText + "\n";
          }
          extractedText = fullText.trim();
          if (extractedText) {
            formData.append("extractedText", extractedText);
            formData.append("pageCount", pdf.numPages.toString());
          }
        } catch (pdfErr) {
          console.warn("Falha na extração local, o servidor tentará via IA:", pdfErr);
        }
      }

      // 2. Enviar para a API
      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Falha na extração");
      }

      const data = await response.json();
      setStatus("success");
      onExtractionComplete(data);
    } catch (err: any) {
      console.error("Erro completo do fetch:", err);
      const errorMsg = err.name === 'TypeError' && err.message === 'Failed to fetch' 
        ? "Erro de Rede: Não foi possível conectar ao servidor. Verifique se o Service Worker foi desativado ou se há bloqueio de firewall (CORS)."
        : `Erro ao processar arquivo: ${err.message || "Erro desconhecido"}`;
      
      setStatus("error");
      setError(errorMsg);
    }
  };

  const reset = () => {
    setFile(null);
    setStatus("idle");
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex min-h-[250px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-200",
          isDragging
            ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10"
            : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-black dark:hover:border-zinc-700",
          status === "uploading" && "pointer-events-none opacity-80"
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".pdf,.txt"
        />

        {status === "idle" && (
          <div className="flex flex-col items-center gap-3 p-8 text-center">
            <div className="rounded-full bg-zinc-100 p-4 dark:bg-zinc-900">
              <Upload className="h-8 w-8 text-zinc-500" />
            </div>
            <div>
              <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Arraste um PDF ou arquivo de texto
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Ou clique para selecionar manualmente (Max 10MB)
              </p>
            </div>
          </div>
        )}

        {status === "uploading" && (
          <div className="flex flex-col items-center gap-4 p-8">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            <p className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
              Extraindo texto de {file?.name}...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4 p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            <div>
              <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Extração concluída!
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                O conteúdo de {file?.name} já está disponível abaixo.
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                reset();
              }}
              className="mt-2 rounded-full border border-zinc-200 px-6 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              Extrair outro arquivo
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4 p-8 text-center">
            <AlertCircle className="h-12 w-12 text-rose-500" />
            <div>
              <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Ocorreu um erro
              </p>
              <p className="text-sm text-rose-500">
                {error}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                reset();
              }}
              className="mt-2 rounded-full bg-zinc-900 px-6 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900"
            >
              Tentar novamente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
