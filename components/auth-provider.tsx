"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";

type Profile = {
  id: string;
  email: string;
  role: "admin" | "user";
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const ADMIN_ONLY_ROUTES = ["/", "/team", "/settings"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sessionData, setSessionData] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    // Fallback de segurança: 10s
    const fallback = setTimeout(() => {
      if (isMounted.current) {
        console.warn("Auth: fallback acionado");
        setLoading(false);
      }
    }, 10000);

    const resolveProfile = async (session: Session) => {
      // 1. Tenta ler o role do JWT app_metadata (imediato, sem DB call)
      const jwtRole = session.user?.app_metadata?.role as "admin" | "user" | undefined;

      if (jwtRole) {
        // Caminho rápido: role disponível no token
        if (isMounted.current) {
          setProfile({ id: session.user.id, email: session.user.email ?? "", role: jwtRole });
          setLoading(false);
        }
        return jwtRole;
      }

      // 2. Fallback: busca na tabela profiles (tokens antigos sem role no JWT)
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, email, role")
          .eq("id", session.user.id)
          .single();

        if (!isMounted.current) return "user";

        if (data?.role) {
          setProfile(data as Profile);
          setLoading(false);
          return data.role as "admin" | "user";
        }

        // Profile não encontrado: cria como user
        const newProfile: Profile = { id: session.user.id, email: session.user.email ?? "", role: "user" };
        await supabase.from("profiles").insert([newProfile]).select().single();
        if (isMounted.current) {
          setProfile(newProfile);
          setLoading(false);
        }
        return "user";
      } catch {
        if (isMounted.current) {
          setProfile({ id: session.user.id, email: session.user.email ?? "", role: "user" });
          setLoading(false);
        }
        return "user";
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted.current) return;

        setSessionData(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const role = await resolveProfile(session);

          // Redireciona apenas ao fazer login (não no refresh)
          if (event === "SIGNED_IN") {
            const currentPath = window.location.pathname;
            if (currentPath === "/login") {
              router.replace(role === "admin" ? "/" : "/upload");
            }
          }
        } else {
          setProfile(null);
          setLoading(false);
          if (event === "SIGNED_OUT") {
            router.push("/login");
          }
        }
      }
    );

    return () => {
      isMounted.current = false;
      clearTimeout(fallback);
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guarda de rotas
  useEffect(() => {
    if (loading) return;

    if (!user && pathname !== "/login") {
      router.replace("/login");
      return;
    }

    if (user && profile?.role === "admin" && pathname === "/login") {
      router.replace("/");
      return;
    }

    if (user && profile?.role === "user" && pathname === "/login") {
      router.replace("/upload");
      return;
    }

    if (user && profile?.role !== "admin" && ADMIN_ONLY_ROUTES.includes(pathname)) {
      router.replace("/upload");
      return;
    }
  }, [loading, user, profile, pathname, router]);

  // 1. Se estiver carregando, mostra tela de bloqueio
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
           <span className="text-emerald-500 animate-pulse text-lg font-bold tracking-widest">
             CORE
           </span>
           <span className="text-zinc-500 text-xs animate-pulse">
             Iniciando sistema...
           </span>
        </div>
      </div>
    );
  }

  // 2. Se não estiver logado e não estiver na página de login, bloqueia e redireciona
  if (!user && pathname !== "/login") {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
           <span className="text-emerald-500 animate-pulse text-lg font-bold tracking-widest">
             CORE
           </span>
           <span className="text-zinc-500 text-xs animate-pulse">
             Verificando acesso...
           </span>
        </div>
      </div>
    );
  }

  // 3. Se estiver logado mas o perfil ainda não subiu, bloqueia para evitar flash de conteúdo errado
  if (user && !profile && pathname !== "/login") {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
           <span className="text-emerald-500 animate-pulse text-lg font-bold tracking-widest">
             CORE
           </span>
           <span className="text-zinc-500 text-xs animate-pulse">
             Carregando perfil...
           </span>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session: sessionData,
        loading,
        logout: async () => { await supabase.auth.signOut(); },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
