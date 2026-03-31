import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Singleton global para evitar múltiplas instâncias (critical em SSR/Vercel)
let _supabaseClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (_supabaseClient) return _supabaseClient;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("⚠️ AVISO: Variáveis de ambiente do Supabase não encontradas!");
  }
  
  _supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
      autoRefreshToken: true,
      storageKey: "core-auth-token",
    },
  });
  
  return _supabaseClient;
}

export const supabase = getSupabaseClient();

// Cliente interno com Service Role para bypass de RLS no backend
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

if (typeof window === "undefined" && !supabaseServiceKey) {
  console.warn(
    "⚠️ AVISO: SUPABASE_SERVICE_ROLE_KEY não encontrada no ambiente de servidor."
  );
}

export const supabaseAdmin =
  typeof window === "undefined"
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : (null as any);
