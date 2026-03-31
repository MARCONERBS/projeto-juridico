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

// Rotas exclusivas de admin
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

    // Fallback de segurança: 8s
    const fallback = setTimeout(() => {
      if (isMounted.current) {
        console.warn("Auth: fallback acionado");
        setLoading(false);
      }
    }, 8000);

    /**
     * Usamos APENAS onAuthStateChange como fonte de verdade.
     * O evento INITIAL_SESSION é disparado imediatamente na montagem
     * com a sessão já existente no localStorage — sem precisar chamar
     * getSession() separadamente (que causava race condition).
     */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted.current) return;

        setSessionData(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Busca o perfil do banco
          try {
            const { data, error } = await supabase
              .from("profiles")
              .select("id, email, role")
              .eq("id", session.user.id)
              .single();

            if (!isMounted.current) return;

            let resolvedProfile: Profile;

            if (error && error.code === "PGRST116") {
              // Novo usuário: cria com role "user"
              const newProfile: Profile = {
                id: session.user.id,
                email: session.user.email!,
                role: "user",
              };
              await supabase.from("profiles").insert([newProfile]);
              resolvedProfile = newProfile;
            } else if (data) {
              resolvedProfile = data as Profile;
            } else {
              // Erro inesperado: trata como user por segurança
              console.error("Auth: erro ao carregar profile", error);
              resolvedProfile = {
                id: session.user.id,
                email: session.user.email!,
                role: "user",
              };
            }

            if (!isMounted.current) return;

            setProfile(resolvedProfile);

            // Redireciona por role APENAS na tela de login
            // (no refresh, o usuário já está na rota certa — não mover)
            if (event === "SIGNED_IN" && window.location.pathname === "/login") {
              if (resolvedProfile.role === "admin") {
                router.replace("/");
              } else {
                router.replace("/upload");
              }
            }
          } catch (err) {
            console.error("Auth: exceção ao buscar profile", err);
            if (isMounted.current) setProfile(null);
          } finally {
            if (isMounted.current) setLoading(false);
          }
        } else {
          // Sem sessão: limpa e volta ao login
          setProfile(null);
          setLoading(false);
          if (event !== "INITIAL_SESSION") {
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

    // Não logado em rota privada
    if (!user && pathname !== "/login") {
      router.replace("/login");
      return;
    }

    // Usuário comum em rota de admin
    if (user && profile && profile.role !== "admin" && ADMIN_ONLY_ROUTES.includes(pathname)) {
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
