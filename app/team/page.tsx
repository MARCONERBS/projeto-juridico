"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { Shield, UserPlus, KeyRound, Loader2, ArrowRight, UserCheck, ShieldCheck, Mail, Users, Globe, Lock, MoreHorizontal, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type TeamMember = {
  id: string;
  email: string;
  role: string;
  created_at: string;
};

export default function TeamPage() {
  const { profile, session } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user"|"admin">("user");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{type: "error"|"success", text: string} | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);

  // Estados para troca de senha
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newPasswordForUser, setNewPasswordForUser] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const fetchTeam = async () => {
    if (!session?.access_token) return;
    setLoadingTeam(true);
    try {
      const res = await fetch("/api/admin/list-users", {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      });
      const data = await res.json();
      if (res.ok) setTeam(data.users || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTeam(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [session]);

  if (profile?.role !== "admin") {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-black">
        <div className="text-center">
          <Lock className="mx-auto h-12 w-12 text-zinc-900" />
          <p className="mt-4 text-sm font-medium text-zinc-700">Acesso Restrito</p>
        </div>
      </div>
    );
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ email, password, role })
      });
      const json = await res.json();
      if (!res.ok) {
        setMsg({ type: "error", text: json.error || "Erro no cadastro." });
      } else {
        setMsg({ type: "success", text: "Sucesso!" });
        setEmail(""); setPassword(""); setRole("user");
        setTimeout(() => setMsg(null), 3000);
        fetchTeam();
      }
    } catch (err: any) {
      setMsg({ type: "error", text: "Erro de rede." });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (userId: string) => {
    if (newPasswordForUser.length < 6) {
      alert("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    setUpdatingPassword(true);
    try {
      const res = await fetch("/api/admin/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ userId, newPassword: newPasswordForUser })
      });
      const json = await res.json();
      if (res.ok) {
        setEditingUserId(null);
        setNewPasswordForUser("");
        setMsg({ type: "success", text: "Senha alterada com sucesso!" });
        setTimeout(() => setMsg(null), 3000);
      } else {
        alert(json.error || "Erro ao atualizar senha.");
      }
    } catch (e) {
      alert("Erro de rede.");
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black text-zinc-300 p-4 lg:p-12">
      
      <div className="mx-auto max-w-6xl animate-in fade-in duration-500">
        
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Gestão de Equipe</h1>
            <p className="text-zinc-500 mt-1">Gerencie os acessos e permissões dos seus colaboradores.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-xl border border-zinc-800">
             <div className="h-2 w-2 bg-emerald-500 rounded-full"></div>
             <span className="text-sm font-medium text-zinc-400">{team.length} Usuários Ativos</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-4 bg-zinc-900 rounded-2xl border border-zinc-800 p-8">
             <div className="flex items-center gap-3 mb-8">
               <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                 <UserPlus className="h-5 w-5 text-indigo-400" />
               </div>
               <h2 className="text-lg font-semibold text-white uppercase tracking-tight">CADASTRAR VENDEDOR</h2>
             </div>

             <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-4 text-left">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400 ml-1">E-mail do Vendedor</label>
                    <div className="relative group">
                       <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-700 group-focus-within:text-indigo-500 transition-colors" />
                       <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="ex: joao@empresa.com"
                          className="w-full h-11 bg-black border border-zinc-800 rounded-xl pl-10 pr-4 text-sm outline-none focus:border-indigo-500 transition-all text-white"
                       />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400 ml-1">Senha Provisória</label>
                    <div className="relative group">
                       <KeyRound className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-700 group-focus-within:text-indigo-500 transition-colors" />
                       <input
                          type="password"
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min. 6 caracteres"
                          className="w-full h-11 bg-black border border-zinc-800 rounded-xl pl-10 pr-4 text-sm outline-none focus:border-indigo-500 transition-all text-white"
                       />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                   <label className="text-sm font-medium text-zinc-400 ml-1">Nível de Acesso</label>
                   <div className="grid grid-cols-2 gap-2">
                      <button
                         type="button"
                         onClick={() => setRole("user")}
                         className={cn(
                           "h-11 rounded-xl text-sm font-semibold transition-all border",
                           role === "user" ? "bg-indigo-600 border-indigo-600 text-white" : "bg-black border-zinc-800 text-zinc-600 hover:bg-zinc-900"
                         )}
                      >
                         Vendedor
                      </button>
                      <button
                         type="button"
                         onClick={() => setRole("admin")}
                         className={cn(
                           "h-11 rounded-xl text-sm font-semibold transition-all border",
                           role === "admin" ? "bg-zinc-100 border-zinc-100 text-black" : "bg-black border-zinc-800 text-zinc-600 hover:bg-zinc-900"
                         )}
                      >
                         Admin
                      </button>
                   </div>
                </div>

                <button
                   type="submit"
                   disabled={loading}
                   className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40"
                >
                   {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                   ) : (
                      <>
                        <span>Emitir Acesso</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                   )}
                </button>

                {msg && (
                  <div className={cn(
                    "text-center text-xs font-bold p-3 rounded-xl",
                    msg.type === 'success' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                  )}>
                    {msg.text}
                  </div>
                )}
             </form>
          </div>

          <div className="lg:col-span-8 bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden flex flex-col">
             <div className="px-8 py-6 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <Users className="h-5 w-5 text-zinc-600" />
                   <h2 className="text-lg font-semibold text-white">EQUIPE DE VENDEDOR</h2>
                </div>
                <MoreHorizontal className="h-5 w-5 text-zinc-700" />
             </div>

             {loadingTeam ? (
                <div className="p-20 flex flex-col items-center justify-center gap-4">
                   <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
             ) : (
                <div className="divide-y divide-zinc-800 overflow-y-auto max-h-[550px]">
                   {team.map((user) => (
                      <div key={user.id} className="px-8 py-6 flex items-center justify-between hover:bg-black transition-colors group">
                         <div className="flex items-center gap-4 flex-1">
                            <div className={cn(
                               "h-12 w-12 rounded-xl flex items-center justify-center border transition-transform",
                               user.role === 'admin' ? "bg-white border-zinc-100 text-black" : "bg-black border-zinc-800 text-zinc-600"
                            )}>
                               {user.role === 'admin' ? <ShieldCheck className="h-5 w-5" /> : <Globe className="h-5 w-5 text-indigo-600" />}
                            </div>
                            <div className="flex-1">
                               <p className="text-base font-bold text-white transition-colors">{user.email}</p>
                               <div className="flex items-center gap-2 mt-0.5">
                                  <span className={cn(
                                     "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                                     user.role === 'admin' ? "bg-zinc-800 text-zinc-100 border-zinc-700" : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                  )}>
                                     {user.role === 'admin' ? "Administrador" : "Vendedor"}
                                  </span>
                                  <span className="text-[10px] text-zinc-600 font-medium font-mono uppercase">
                                     • {new Date(user.created_at).toLocaleDateString()}
                                  </span>
                               </div>
                            </div>
                         </div>
                         
                         {/* Interface de Troca de Senha */}
                         <div className="flex items-center gap-3">
                            {editingUserId === user.id ? (
                               <div className="flex items-center gap-2 animate-in slide-in-from-right-2">
                                  <input 
                                     type="password"
                                     value={newPasswordForUser}
                                     onChange={(e) => setNewPasswordForUser(e.target.value)}
                                     placeholder="Nova senha"
                                     className="bg-black border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500 w-32"
                                  />
                                  <button 
                                     onClick={() => handleUpdatePassword(user.id)}
                                     disabled={updatingPassword}
                                     className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                                  >
                                     {updatingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                  </button>
                                  <button 
                                     onClick={() => { setEditingUserId(null); setNewPasswordForUser(""); }}
                                     className="p-1.5 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-all"
                                  >
                                     <X className="h-4 w-4" />
                                  </button>
                               </div>
                            ) : (
                               <button 
                                  onClick={() => setEditingUserId(user.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-zinc-800 rounded-lg border border-transparent hover:border-zinc-700"
                                  title="Mudar Senha"
                                >
                                  <ArrowRight className="h-4 w-4 text-zinc-500" />
                               </button>
                            )}
                         </div>
                      </div>
                   ))}
                </div>
             )}

             <div className="px-8 py-4 bg-black border-t border-zinc-800 text-center">
                <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest font-mono">CODE VERIFICATION SYSTEM // CORE AI</p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
