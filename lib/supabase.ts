import { createClient } from "@supabase/supabase-js";

// Cliente público para o frontend
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (typeof window !== "undefined" && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn("⚠️ AVISO: Variáveis de ambiente do Supabase não encontradas! Verifique as configurações no Vercel.");
}

function createBrowserClient() {
  if (typeof window !== "undefined") {
    if (!(window as any)._supabase) {
      (window as any)._supabase = createClient(supabaseUrl, supabaseAnonKey);
    }
    return (window as any)._supabase;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = createBrowserClient();

// Cliente interno com Service Role para bypass de RLS no backend
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (typeof window === "undefined" && !supabaseServiceKey) {
  console.warn("⚠️ AVISO: SUPABASE_SERVICE_ROLE_KEY não encontrada no ambiente de servidor.");
}

export const supabaseAdmin = typeof window === "undefined" 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null as any; // No browser não deve ser usado
