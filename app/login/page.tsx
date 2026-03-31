"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

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
      return;
    }
  };

  return (
    <div className="login-root">
      {/* Animated background blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      {/* Grid overlay */}
      <div className="grid-overlay" />

      <div className="login-container">
        {/* Left Panel — Branding */}
        <div className="login-left">
          <div className="brand-content">
            <div className="logo-wrapper">
              <Image
                src="/logo.png"
                alt="Logo"
                width={260}
                height={75}
                priority
                style={{ objectFit: "contain" }}
              />
            </div>
            <div className="brand-divider" />
            <h1 className="brand-title">Sistema Inteligente de<br />Extração Jurídica</h1>
            <p className="brand-subtitle">
              Processe documentos PDF com IA, extraia metadados com precisão e gerencie todo o fluxo jurídico em um único lugar.
            </p>
            <div className="feature-list">
              {["Extração automática com IA", "Gestão de documentos", "Acesso multiusuário", "Integração com N8N"].map((f) => (
                <div key={f} className="feature-item">
                  <div className="feature-dot" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="brand-footer">© 2025 · Todos os direitos reservados</p>
        </div>

        {/* Right Panel — Form */}
        <div className="login-right">
          <div className="login-card">
            {/* Mobile logo */}
            <div className="mobile-logo">
              <Image
                src="/logo.png"
                alt="Logo"
                width={180}
                height={52}
                priority
                style={{ objectFit: "contain" }}
              />
            </div>

            <div className="card-header">
              <h2 className="card-title">Bem-vindo de volta</h2>
              <p className="card-subtitle">Entre com suas credenciais para acessar o painel</p>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              {errorMsg && (
                <div className="error-box">
                  <AlertCircle className="error-icon" />
                  <p>{errorMsg}</p>
                </div>
              )}

              <div className="field-group">
                <label className="field-label">E-mail</label>
                <div className="field-wrapper">
                  <Mail className="field-icon" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="field-input"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Senha</label>
                <div className="field-wrapper">
                  <Lock className="field-icon" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="field-input"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="eye-btn"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="submit-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="spin-icon" />
                    Verificando...
                  </>
                ) : (
                  "Entrar no Sistema"
                )}
              </button>
            </form>

            <p className="card-footer">
              Sem acesso?{" "}
              <span className="contact-link">Contate o administrador</span>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* ===== ROOT ===== */
        .login-root {
          position: relative;
          min-height: 100vh;
          width: 100%;
          display: flex;
          overflow: hidden;
          background: #020d05;
          font-family: 'Inter', 'Geist', system-ui, sans-serif;
        }

        /* ===== ANIMATED BLOBS ===== */
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.25;
          animation: float 12s ease-in-out infinite;
          pointer-events: none;
        }
        .blob-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, #22c55e, #16a34a);
          top: -120px; left: -100px;
          animation-delay: 0s;
        }
        .blob-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, #15803d, #052e16);
          bottom: -80px; right: 10%;
          animation-delay: -4s;
        }
        .blob-3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, #4ade80, #22c55e);
          top: 40%; left: 35%;
          animation-delay: -8s;
          opacity: 0.1;
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.97); }
        }

        /* ===== GRID OVERLAY ===== */
        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(34, 197, 94, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 197, 94, 0.04) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        /* ===== LAYOUT ===== */
        .login-container {
          position: relative;
          z-index: 10;
          display: flex;
          width: 100%;
          min-height: 100vh;
        }

        /* ===== LEFT PANEL ===== */
        .login-left {
          display: none;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          padding: 3rem 4rem;
          flex: 1;
          border-right: 1px solid rgba(34, 197, 94, 0.12);
          background: linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(5, 46, 22, 0.3) 100%);
          backdrop-filter: blur(4px);
        }
        @media (min-width: 1024px) {
          .login-left { display: flex; }
        }

        .brand-content { display: flex; flex-direction: column; gap: 1.5rem; margin-top: 2rem; max-width: 480px; width: 100%; }

        .logo-wrapper {
          display: flex;
          align-items: center;
        }

        .brand-divider {
          width: 48px;
          height: 3px;
          background: linear-gradient(90deg, #22c55e, #4ade80);
          border-radius: 9999px;
          margin: 0.5rem 0;
        }

        .brand-title {
          font-size: 2rem;
          font-weight: 700;
          line-height: 1.25;
          color: #f0fdf4;
          letter-spacing: -0.02em;
        }

        .brand-subtitle {
          font-size: 0.95rem;
          color: #86efac;
          line-height: 1.7;
          max-width: 400px;
        }

        .feature-list { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 0.5rem; }
        .feature-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: #bbf7d0;
        }
        .feature-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 8px #22c55e;
          flex-shrink: 0;
        }

        .brand-footer {
          font-size: 0.75rem;
          color: rgba(134, 239, 172, 0.5);
          width: 100%;
          max-width: 480px;
        }

        /* ===== RIGHT PANEL ===== */
        .login-right {
          flex: 1;
          display: flex;
          align-items: stretch;
          justify-content: center;
          padding: 0;
        }
        @media (min-width: 1024px) {
          .login-right {
            flex: 0 0 480px;
            align-items: center;
            padding: 2rem 1.5rem;
          }
        }

        /* ===== CARD ===== */
        .login-card {
          width: 100%;
          background: rgba(2, 20, 8, 0.97);
          border: none;
          border-radius: 0;
          padding: 3rem 2rem 2.5rem;
          backdrop-filter: blur(20px);
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
          justify-content: center;
          min-height: 100vh;
        }
        @media (min-width: 1024px) {
          .login-card {
            min-height: unset;
            max-width: 420px;
            border: 1px solid rgba(34, 197, 94, 0.15);
            border-radius: 1.5rem;
            padding: 2.5rem;
            background: rgba(255, 255, 255, 0.04);
            box-shadow:
              0 0 0 1px rgba(34, 197, 94, 0.05),
              0 32px 64px rgba(0, 0, 0, 0.5),
              0 0 80px rgba(34, 197, 94, 0.06);
          }
        }

        /* Mobile logo */
        .mobile-logo {
          display: flex;
          justify-content: center;
        }
        @media (min-width: 1024px) {
          .mobile-logo { display: none; }
        }

        /* ===== CARD HEADER ===== */
        .card-header { display: flex; flex-direction: column; gap: 0.375rem; }
        .card-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #f0fdf4;
          letter-spacing: -0.02em;
        }
        .card-subtitle {
          font-size: 0.875rem;
          color: #86efac;
          opacity: 0.7;
        }

        /* ===== FORM ===== */
        .login-form { display: flex; flex-direction: column; gap: 1.25rem; }

        .error-box {
          display: flex;
          align-items: flex-start;
          gap: 0.625rem;
          padding: 0.875rem 1rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: 0.75rem;
          font-size: 0.875rem;
          color: #fca5a5;
        }
        .error-icon { width: 16px; height: 16px; flex-shrink: 0; margin-top: 1px; color: #f87171; }

        /* ===== FIELDS ===== */
        .field-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .field-label {
          font-size: 0.8125rem;
          font-weight: 500;
          color: #bbf7d0;
          letter-spacing: 0.01em;
        }
        .field-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .field-icon {
          position: absolute;
          left: 0.875rem;
          width: 16px; height: 16px;
          color: rgba(134, 239, 172, 0.5);
          pointer-events: none;
          flex-shrink: 0;
        }
        .field-input {
          width: 100%;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(34, 197, 94, 0.2);
          border-radius: 0.75rem;
          padding: 0.75rem 2.75rem;
          font-size: 0.9rem;
          color: #f0fdf4;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .field-input::placeholder { color: rgba(134, 239, 172, 0.3); }
        .field-input:focus {
          border-color: #22c55e;
          background: rgba(0, 0, 0, 0.6);
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.12);
        }

        .eye-btn {
          position: absolute;
          right: 0.875rem;
          background: transparent;
          border: none;
          cursor: pointer;
          color: rgba(134, 239, 172, 0.5);
          display: flex;
          align-items: center;
          padding: 0;
          transition: color 0.2s;
        }
        .eye-btn:hover { color: #86efac; }

        /* ===== SUBMIT BUTTON ===== */
        .submit-btn {
          margin-top: 0.5rem;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.875rem;
          background: linear-gradient(135deg, #16a34a, #22c55e);
          border: none;
          border-radius: 0.875rem;
          font-size: 0.9375rem;
          font-weight: 600;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 24px rgba(34, 197, 94, 0.3);
          letter-spacing: 0.01em;
        }
        .submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #15803d, #16a34a);
          box-shadow: 0 8px 32px rgba(34, 197, 94, 0.45);
          transform: translateY(-1px);
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .spin-icon {
          width: 16px; height: 16px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ===== FOOTER ===== */
        .card-footer {
          text-align: center;
          font-size: 0.8125rem;
          color: rgba(134, 239, 172, 0.5);
        }
        .contact-link {
          color: #4ade80;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.2s;
        }
        .contact-link:hover { color: #86efac; }
      `}</style>
    </div>
  );
}
