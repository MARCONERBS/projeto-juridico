"use client";

import { createContext, useContext, useEffect, useState } from "react";
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

  useEffect(() => {
    // Busca a sessão inicial
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setSessionData(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email!);
      } else {
        setLoading(false);
      }
    });

    // Escuta mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        setSessionData(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id, session.user.email!);
        } else {
          setProfile(null);
          setLoading(false);
          router.push("/login"); // Força o login ao deslogar
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const fetchProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error && error.code === "PGRST116") {
        const newProfile = { id: userId, email, role: "user" };
        await (supabase as any).from("profiles").insert([newProfile]);
        setProfile(newProfile as Profile);
      } else {
        setProfile(data ? (data as unknown as Profile) : null);
      }
    } catch (err) {
      console.error("Erro ao carregar perfil:", err);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  // Bloqueio de rotas se não estiver logado
  useEffect(() => {
    if (!loading && !user && pathname !== "/login") {
      router.replace("/login");
    }
    // Se logado e em login, manda pro inicio
    if (!loading && user && pathname === "/login") {
      router.replace("/");
    }
  }, [user, loading, pathname, router]);

  // Enquanto carrega a primeira vez, não renderizar o APP se for rota privada
  if (loading && pathname !== "/login") {
    return <div className="flex h-screen items-center justify-center bg-black"><span className="text-white animate-pulse">Carregando CORE...</span></div>;
  }

  return (
    <AuthContext.Provider value={{ user, profile, session: sessionData, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
