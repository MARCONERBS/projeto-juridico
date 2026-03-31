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

// Rotas exclusivas de admin - usuários comuns serão redirecionados
const ADMIN_ONLY_ROUTES = ["/", "/team", "/settings"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sessionData, setSessionData] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isMounted = useRef(true);
  const isInitialized = useRef(false);

  // Função central de redirecionamento por role
  const redirectByRole = (role: "admin" | "user", currentPath: string) => {
    if (role === "admin") {
      // Admin: só redireciona se estiver no login
      if (currentPath === "/login") {
        router.replace("/");
      }
    } else {
      // Usuário comum: redireciona do login e de rotas de admin
      if (currentPath === "/login" || ADMIN_ONLY_ROUTES.includes(currentPath)) {
        router.replace("/upload");
      }
    }
  };

  const fetchProfile = async (userId: string, email: string, currentPath: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (!isMounted.current) return;

      let resolvedProfile: Profile;

      if (error && error.code === "PGRST116") {
        // Novo usuário — cria com role "user"
        const newProfile = { id: userId, email, role: "user" as const };
        await supabase.from("profiles").insert([newProfile]);
        resolvedProfile = newProfile;
      } else {
        resolvedProfile = data as Profile;
      }

      if (!isMounted.current) return;

      setProfile(resolvedProfile);

      // Agora que temos o profile, redirecionamos com base no role
      redirectByRole(resolvedProfile.role, currentPath);
    } catch (err) {
      console.error("Erro ao carregar perfil:", err);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    isMounted.current = true;
    isInitialized.current = false;

    // Fallback de segurança: 6s para liberar a tela
    const fallbackTimer = setTimeout(() => {
      if (isMounted.current) {
        console.warn("Auth: fallback de 6s acionado");
        setLoading(false);
      }
    }, 6000);

    // Inicializa sessão existente (refresh de página)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted.current) return;
      isInitialized.current = true;
      setSessionData(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchProfile(session.user.id, session.user.email!, pathname);
      } else {
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted.current) setLoading(false);
    });

    // Escuta eventos de auth (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted.current) return;

        // Evita duplicata com getSession no primeiro carregamento
        if (event === "INITIAL_SESSION") return;

        setSessionData(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Obtemos pathname atual via ref para não fechar sobre valor antigo
          const currentPath = window.location.pathname;
          await fetchProfile(session.user.id, session.user.email!, currentPath);
        } else {
          setProfile(null);
          setLoading(false);
          router.push("/login");
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

  // Guarda de rotas: protege rotas de admin de usuários comuns
  useEffect(() => {
    if (loading || !user || !profile) return;

    if (profile.role !== "admin" && ADMIN_ONLY_ROUTES.includes(pathname)) {
      router.replace("/upload");
    }

    if (!user && pathname !== "/login") {
      router.replace("/login");
    }
  }, [loading, user, profile, pathname, router]);

  // Tela de carregamento (apenas em rotas privadas)
  if (loading && pathname !== "/login") {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <span className="text-white animate-pulse">Carregando CORE...</span>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, profile, session: sessionData, loading, logout: async () => { await supabase.auth.signOut(); } }}>
      {children}
    </AuthContext.Provider>
  );
}
