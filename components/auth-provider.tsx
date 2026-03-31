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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sessionData, setSessionData] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Evita setar estado após desmonte
  const isMounted = useRef(true);
  const hasResolved = useRef(false);

  const resolveLoading = () => {
    if (!hasResolved.current && isMounted.current) {
      hasResolved.current = true;
      setLoading(false);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    hasResolved.current = false;

    // Fallback: se em 5 segundos nada resolver, libera a tela
    const fallbackTimer = setTimeout(() => {
      if (isMounted.current && !hasResolved.current) {
        console.warn("Auth: timeout de fallback acionado.");
        resolveLoading();
      }
    }, 5000);

    // Busca a sessão inicial
    supabase.auth
      .getSession()
      .then(({ data: { session } }: { data: { session: Session | null } }) => {
        if (!isMounted.current) return;
        setSessionData(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id, session.user.email!);
        } else {
          resolveLoading();
        }
      })
      .catch((err) => {
        console.error("Auth: erro ao buscar sessão:", err);
        resolveLoading();
      });

    // Escuta mudanças de auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        if (!isMounted.current) return;
        setSessionData(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id, session.user.email!);
        } else {
          setProfile(null);
          resolveLoading();
          if (pathname !== "/login") {
            router.push("/login");
          }
        }
      }
    );

    return () => {
      isMounted.current = false;
      clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (!isMounted.current) return;

      if (error && error.code === "PGRST116") {
        const newProfile = { id: userId, email, role: "user" };
        await (supabase as any).from("profiles").insert([newProfile]);
        if (isMounted.current) setProfile(newProfile as Profile);
      } else {
        if (isMounted.current)
          setProfile(data ? (data as unknown as Profile) : null);
      }
    } catch (err) {
      console.error("Erro ao carregar perfil:", err);
    } finally {
      resolveLoading();
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  // Rotas exclusivas de admin
  const adminOnlyRoutes = ["/", "/team", "/settings"];

  // Bloqueio de rotas por autenticação e role
  useEffect(() => {
    if (loading) return;

    // Não logado → vai para login
    if (!user && pathname !== "/login") {
      router.replace("/login");
      return;
    }

    // Logado + na tela de login → redireciona por role
    if (user && profile && pathname === "/login") {
      if (profile.role === "admin") {
        router.replace("/");
      } else {
        router.replace("/upload");
      }
      return;
    }

    // Usuário comum tentando acessar rota de admin
    if (user && profile && profile.role !== "admin" && adminOnlyRoutes.includes(pathname)) {
      router.replace("/upload");
      return;
    }
  }, [user, profile, loading, pathname, router]);

  // Enquanto carrega a primeira vez, não renderizar o APP se for rota privada
  if (loading && pathname !== "/login") {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <span className="text-white animate-pulse">Carregando CORE...</span>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ user, profile, session: sessionData, loading, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
