"use client";

import { useState, useEffect } from "react";
import { Settings, Key, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

export default function SettingsPage() {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState("");
  const [n8nWebhook, setN8nWebhook] = useState("");
  const [n8nWebhookVencimento, setN8nWebhookVencimento] = useState("");
  const [diasVencimento, setDiasVencimento] = useState("5");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      try {
        const sessionStr = localStorage.getItem("sb-yjtwznbeeefnmfoccfqj-auth-token");
        const session = sessionStr ? JSON.parse(sessionStr) : null;
        const token = session?.access_token;

        const res = await fetch("/api/admin/settings", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setApiKey(data.settings.gemini_api_key || "");
            setN8nWebhook(data.settings.n8n_webhook || "");
            setN8nWebhookVencimento(data.settings.n8n_webhook_vencimento || "");
            setDiasVencimento(data.settings.dias_vencimento ? String(data.settings.dias_vencimento) : "5");
          }
        }
      } catch (err) {
        console.error("Erro ao carregar settings:", err);
      } finally {
        setLoading(false);
      }
    }

    if (user) fetchSettings();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    
    try {
      const sessionStr = localStorage.getItem("sb-yjtwznbeeefnmfoccfqj-auth-token");
      const session = sessionStr ? JSON.parse(sessionStr) : null;
      const token = session?.access_token;

      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          gemini_api_key: apiKey.trim(),
          n8n_webhook: n8nWebhook.trim(),
          n8n_webhook_vencimento: n8nWebhookVencimento.trim(),
          dias_vencimento: parseInt(diasVencimento) || 5
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Falha ao salvar");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Configurações do Sistema
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Gerencie chaves globais da plataforma. Essas chaves serão usadas por todos os vendedores.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-black">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Painel de Integração (Master)</h2>
        </div>
        
        <div className="max-w-xl space-y-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Configure abaixo as chaves que alimentarão toda a operação. Estas informações são salvas com segurança no banco de dados.
          </p>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-300 flex items-center gap-2">
              <Key className="h-4 w-4" />
              Google Gemini API Key (Global)
            </label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          <div className="space-y-2 pt-4">
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-300 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
              URL do Webhook n8n (Extração Automática)
            </label>
            <input
              type="url"
              placeholder="https://sua-instancia.n8n.cloud/webhook/..."
              value={n8nWebhook}
              onChange={(e) => setN8nWebhook(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">Alertas de Vencimento</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-300 flex items-center gap-2">
                URL do Webhook n8n (Notificações de Vencimento)
              </label>
              <input
                type="url"
                placeholder="https://sua-instancia.n8n.cloud/webhook/alertas..."
                value={n8nWebhookVencimento}
                onChange={(e) => setN8nWebhookVencimento(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-300 flex items-center gap-2">
                Avisar quantos dias antes do vencimento?
              </label>
              <input
                type="number"
                min="0"
                placeholder="Ex: 5"
                value={diasVencimento}
                onChange={(e) => setDiasVencimento(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 md:w-1/3"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-rose-600 text-sm mt-4">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="flex items-center gap-4 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {saving ? "Salvando..." : "Salvar no Banco de Dados"}
            </button>
            
            {saved && (
              <span className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                <CheckCircle className="h-4 w-4" />
                Configurações aplicadas globalmente!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
