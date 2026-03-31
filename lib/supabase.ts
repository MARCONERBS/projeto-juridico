import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let _supabaseClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (_supabaseClient) return _supabaseClient;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("⚠️ AVISO: Variáveis de ambiente do Supabase não encontradas!");
  }

  // IMPORTANTE: Não usar storageKey customizado - usa o padrão do Supabase
  // para não quebrar sessões existentes no browser
  _supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
      autoRefreshToken: true,
    },
  });

  return _supabaseClient;
}

export const supabase = getSupabaseClient();

// Cliente admin com Service Role (só no servidor)
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

export const supabaseAdmin =
  typeof window === "undefined"
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : (null as any);
