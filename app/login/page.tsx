"use client";

import { useState } from "react";
import { Mail, Lock, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErrorMsg(
        error.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : error.message
      );
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .pg {
          display: flex;
          min-height: 100vh;
          width: 100%;
          background: #020d05;
          font-family: 'Inter', system-ui, sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* blobs */
        .b1,.b2,.b3 {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          animation: fl 14s ease-in-out infinite;
        }
        .b1 { width:520px;height:520px;background:radial-gradient(circle,#22c55e,#15803d);top:-160px;left:-120px;opacity:.22; }
        .b2 { width:420px;height:420px;background:radial-gradient(circle,#16a34a,#052e16);bottom:-100px;right:5%;opacity:.2;animation-delay:-5s; }
        .b3 { width:260px;height:260px;background:#4ade80;top:45%;left:40%;opacity:.07;animation-delay:-9s; }
        @keyframes fl {
          0%,100%{transform:translate(0,0) scale(1);}
          40%{transform:translate(28px,-28px) scale(1.06);}
          70%{transform:translate(-18px,18px) scale(.96);}
        }

        /* grid */
        .grid-bg {
          position:absolute;inset:0;pointer-events:none;
          background-image:
            linear-gradient(rgba(34,197,94,.04) 1px,transparent 1px),
            linear-gradient(90deg,rgba(34,197,94,.04) 1px,transparent 1px);
          background-size:44px 44px;
        }

        /* ── LEFT (desktop only) ── */
        .left {
          display: none;
          position: relative;
          z-index: 1;
          flex: 1;
          border-right: 1px solid rgba(34,197,94,.1);
          background: linear-gradient(150deg,rgba(0,0,0,.55) 0%,rgba(5,46,22,.28) 100%);
          /* vertical + horizontal center */
          align-items: center;
          justify-content: center;
        }
        @media(min-width:1024px){ .left { display:flex; } }

        .left-inner {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
          max-width: 460px;
          width: 100%;
          padding: 0 3.5rem;
        }



        .left-foot {
          position: absolute;
          bottom: 2rem;
          left: 0; right: 0;
          text-align: center;
          font-size: .73rem;
          color: rgba(134,239,172,.4);
        }

        /* ── RIGHT ── */
        .right {
          flex: 1;
          display: flex;
          position: relative;
          z-index: 1;
        }
        @media(min-width:1024px){
          .right { flex: 0 0 460px; align-items:center; justify-content:center; padding: 2rem; }
        }

        /* ── CARD ── */
        .card {
          width: 100%;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 1.75rem;
          padding: 3.5rem 2rem 3rem;
          background: rgba(2,18,7,.97);
        }
        @media(min-width:1024px){
          .card {
            min-height: unset;
            max-width: 420px;
            border-radius: 1.5rem;
            border: 1px solid rgba(34,197,94,.16);
            padding: 2.75rem;
            background: rgba(255,255,255,.04);
            backdrop-filter: blur(22px);
            box-shadow: 0 32px 72px rgba(0,0,0,.55), 0 0 80px rgba(34,197,94,.05);
          }
        }

        /* logo — só no mobile */
        .mob-logo { display:flex; justify-content:center; margin-bottom:.25rem; }
        @media(min-width:1024px){ .mob-logo { display:none; } }

        .c-title { font-size:1.55rem; font-weight:700; color:#f0fdf4; letter-spacing:-.022em; }
        .c-sub   { font-size:.87rem; color:#86efac; opacity:.65; margin-top:.3rem; }

        /* form */
        .form  { display:flex; flex-direction:column; gap:1.2rem; }

        .err {
          display:flex; align-items:flex-start; gap:.6rem;
          padding:.85rem 1rem;
          background:rgba(239,68,68,.1);
          border:1px solid rgba(239,68,68,.25);
          border-radius:.75rem;
          font-size:.85rem; color:#fca5a5;
        }
        .err-ic { width:16px;height:16px;flex-shrink:0;margin-top:1px;color:#f87171; }

        .fg    { display:flex; flex-direction:column; gap:.45rem; }
        .lbl   { font-size:.8rem; font-weight:500; color:#bbf7d0; letter-spacing:.01em; }
        .fw    { position:relative; display:flex; align-items:center; }
        .fic   { position:absolute; left:.9rem; width:16px; height:16px; color:rgba(134,239,172,.45); pointer-events:none; }
        .finp  {
          width:100%;
          background:rgba(0,0,0,.45);
          border:1px solid rgba(34,197,94,.18);
          border-radius:.75rem;
          padding:.78rem 2.8rem;
          font-size:.9rem;
          color:#f0fdf4;
          outline:none;
          transition:border-color .18s,box-shadow .18s,background .18s;
        }
        .finp::placeholder { color:rgba(134,239,172,.25); }
        .finp:focus {
          border-color:#22c55e;
          background:rgba(0,0,0,.65);
          box-shadow:0 0 0 3px rgba(34,197,94,.13);
        }
        .eye {
          position:absolute; right:.9rem;
          background:transparent; border:none; cursor:pointer;
          color:rgba(134,239,172,.45); display:flex; align-items:center;
          padding:0; transition:color .18s;
        }
        .eye:hover { color:#86efac; }

        /* button */
        .btn {
          margin-top:.35rem;
          width:100%;
          display:flex; align-items:center; justify-content:center; gap:.5rem;
          padding:.9rem;
          background:linear-gradient(135deg,#16a34a,#22c55e);
          border:none; border-radius:.9rem;
          font-size:.95rem; font-weight:600; color:#fff;
          cursor:pointer;
          transition:all .2s;
          box-shadow:0 4px 24px rgba(34,197,94,.3);
          letter-spacing:.01em;
        }
        .btn:hover:not(:disabled) {
          background:linear-gradient(135deg,#15803d,#16a34a);
          box-shadow:0 8px 36px rgba(34,197,94,.45);
          transform:translateY(-1px);
        }
        .btn:disabled { opacity:.55; cursor:not-allowed; }
        .spin { width:16px;height:16px;animation:sp 1s linear infinite; }
        @keyframes sp { to { transform:rotate(360deg); } }

        .foot { text-align:center; font-size:.8rem; color:rgba(134,239,172,.45); }
        .fl   { color:#4ade80; font-weight:500; cursor:pointer; transition:color .18s; }
        .fl:hover { color:#86efac; }
      `}</style>

      <div className="pg">
        <div className="b1" /><div className="b2" /><div className="b3" />
        <div className="grid-bg" />

        {/* ── LEFT ── */}
        <div className="left">
          <div className="left-inner">
            <Image src="/logo.png" alt="Logo" width={280} height={80} priority style={{objectFit:"contain"}} />
          </div>
          <p className="left-foot">© 2025 · Todos os direitos reservados</p>
        </div>

        {/* ── RIGHT ── */}
        <div className="right">
          <div className="card">

            {/* logo mobile */}
            <div className="mob-logo">
              <Image src="/logo.png" alt="Logo" width={190} height={55} priority style={{objectFit:"contain"}} />
            </div>

            <div>
              <h2 className="c-title">Bem-vindo de volta</h2>
              <p className="c-sub">Entre com suas credenciais para acessar o painel</p>
            </div>

            <form className="form" onSubmit={handleLogin}>
              {errorMsg && (
                <div className="err">
                  <AlertCircle className="err-ic" />
                  <p>{errorMsg}</p>
                </div>
              )}

              <div className="fg">
                <label className="lbl">E-mail</label>
                <div className="fw">
                  <Mail className="fic" />
                  <input id="login-email" type="email" required value={email}
                    onChange={e=>setEmail(e.target.value)}
                    placeholder="seu@email.com" className="finp" autoComplete="email" />
                </div>
              </div>

              <div className="fg">
                <label className="lbl">Senha</label>
                <div className="fw">
                  <Lock className="fic" />
                  <input id="login-password" type={showPassword?"text":"password"} required value={password}
                    onChange={e=>setPassword(e.target.value)}
                    placeholder="••••••••" className="finp" autoComplete="current-password" />
                  <button type="button" className="eye" onClick={()=>setShowPassword(!showPassword)} tabIndex={-1}>
                    {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>

              <button id="login-submit" type="submit" disabled={loading} className="btn">
                {loading ? <><Loader2 className="spin"/>Verificando...</> : "Entrar no Sistema"}
              </button>
            </form>

            <p className="foot">Sem acesso? <span className="fl">Contate o administrador</span></p>
          </div>
        </div>
      </div>
    </>
  );
}
