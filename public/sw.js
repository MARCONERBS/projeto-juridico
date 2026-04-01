const CACHE_NAME = "core-pwa-v2"; // Incrementada para forçar reset do cache
const STATIC_ASSETS = ["/", "/manifest.json", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (e) => {
  console.log("[Service Worker] Install");
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  console.log("[Service Worker] Activate");
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  return self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // 1. Ignora APIs, Supabase e não-GET
  if (
    url.pathname.includes("/api/") ||
    url.hostname.includes("supabase.co") ||
    e.request.method !== "GET"
  ) {
    return e.respondWith(fetch(e.request));
  }

  // 2. Estratégia Network-First para a Navegação (Páginas HTML e ROOT)
  // Isso evita que o navegador mostre o Painel de Administrador cacheado se o usuário não estiver logado.
  if (e.request.mode === "navigate" || url.pathname === "/") {
    return e.respondWith(
      fetch(e.request)
        .then((response) => {
          // Atualiza o cache com a versão mais recente da rede
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          return response;
        })
        .catch(() => {
          // Se estiver offline, tenta o cache
          return caches.match(e.request);
        })
    );
  }

  // 3. Estratégia Cache-First para demais Assets (Imagens, Ícones, etc)
  e.respondWith(
    caches.match(e.request).then((cached) => {
      return cached || fetch(e.request).then((response) => {
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return response;
      });
    })
  );
});
