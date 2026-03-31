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

/**
 * Obtém o role do usuário a partir do JWT (app_metadata).
 * Essa abordagem é imediata (sem DB call) e funciona no refresh.
 * Fallback para "user" se o campo não estiver presente.
 */
function getRoleFromSession(session: Session): "admin" | "user" {
  const role = session.user?.app_metadata?.role;
  return role === "admin" ? "admin" : "user";
}

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

    // Fallback de segurança: 6s
    const fallback = setTimeout(() => {
      if (isMounted.current) {
        console.warn("Auth: fallback acionado");
        setLoading(false);
      }
    }, 6000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted.current) return;

        setSessionData(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Lê o role DIRETAMENTE do JWT - sem DB call, sem race condition
          const role = getRoleFromSession(session);
          const currentProfile: Profile = {
            id: session.user.id,
            email: session.user.email ?? "",
            role,
          };
          setProfile(currentProfile);
          setLoading(false);

          // Redireciona apenas no evento de login (não no refresh)
          if (event === "SIGNED_IN") {
            const currentPath = window.location.pathname;
            if (currentPath === "/login") {
              router.replace(role === "admin" ? "/" : "/upload");
            }
          }
        } else {
          // Sem sessão
          setProfile(null);
          setLoading(false);

          // Redireciona para login apenas em eventos explícitos (não INITIAL_SESSION com null)
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

    // Não logado em rota privada → login
    if (!user && pathname !== "/login") {
      router.replace("/login");
      return;
    }

    // Admin em /login → painel admin
    if (user && profile?.role === "admin" && pathname === "/login") {
      router.replace("/");
      return;
    }

    // Usuário comum em /login → /upload
    if (user && profile?.role === "user" && pathname === "/login") {
      router.replace("/upload");
      return;
    }

    // Usuário comum em rota de admin → /upload
    if (user && profile?.role !== "admin" && ADMIN_ONLY_ROUTES.includes(pathname)) {
      router.replace("/upload");
      return;
    }
  }, [loading, user, profile, pathname, router]);

  // Tela de carregamento
  if (loading && pathname !== "/login") {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <span className="text-white animate-pulse">Carregando CORE...</span>
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
