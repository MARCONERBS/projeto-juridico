"use client";

import { useEffect, useState } from "react";

export function PwaRegistry() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Registra o service worker imediatamente (sem esperar o evento "load")
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[PWA] SW registrado:", reg.scope);
        })
        .catch((err) => {
          console.warn("[PWA] Falha ao registrar SW:", err);
        });
    }

    // Captura o evento de instalação do PWA
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Mostra o banner apenas se ainda não foi instalado
      if (!window.matchMedia("(display-mode: standalone)").matches) {
        setShowBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler as EventListener);

    // Esconde o banner se o app já foi instalado
    window.addEventListener("appinstalled", () => {
      setShowBanner(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler as EventListener);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
      setDeferredPrompt(null);
    }
  };

  if (!showBanner) return null;

  return (
    <>
      <style>{`
        .pwa-banner {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          background: linear-gradient(135deg, #052e16, #14532d);
          border-top: 1px solid rgba(34, 197, 94, 0.3);
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          box-shadow: 0 -8px 32px rgba(0,0,0,0.4);
          animation: slideUp .35s ease;
        }
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
        .pwa-info { display: flex; align-items: center; gap: .75rem; }
        .pwa-icon {
          width: 44px; height: 44px;
          border-radius: 10px;
          overflow: hidden;
          flex-shrink: 0;
          background: #000;
        }
        .pwa-icon img { width: 100%; height: 100%; object-fit: cover; }
        .pwa-text h4 { font-size: .875rem; font-weight: 600; color: #f0fdf4; }
        .pwa-text p  { font-size: .75rem;  color: #86efac; margin-top: 1px; }
        .pwa-actions { display: flex; align-items: center; gap: .5rem; flex-shrink: 0; }
        .pwa-btn-install {
          background: linear-gradient(135deg, #16a34a, #22c55e);
          color: #fff;
          border: none;
          border-radius: .6rem;
          padding: .55rem 1.1rem;
          font-size: .82rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(34,197,94,.35);
          transition: all .2s;
        }
        .pwa-btn-install:hover { background: linear-gradient(135deg,#15803d,#16a34a); transform: translateY(-1px); }
        .pwa-btn-close {
          background: transparent;
          border: 1px solid rgba(134,239,172,.25);
          color: #86efac;
          border-radius: .6rem;
          padding: .55rem .75rem;
          font-size: .82rem;
          cursor: pointer;
          transition: all .2s;
        }
        .pwa-btn-close:hover { background: rgba(134,239,172,.08); }
      `}</style>

      <div className="pwa-banner">
        <div className="pwa-info">
          <div className="pwa-icon">
            <img src="/icon-192.png" alt="App icon" />
          </div>
          <div className="pwa-text">
            <h4>Instalar Arcofoods</h4>
            <p>Adicione à tela inicial para acesso rápido</p>
          </div>
        </div>
        <div className="pwa-actions">
          <button className="pwa-btn-install" onClick={handleInstall}>
            Instalar
          </button>
          <button className="pwa-btn-close" onClick={() => setShowBanner(false)}>
            Agora não
          </button>
        </div>
      </div>
    </>
  );
}
