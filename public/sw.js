const CACHE_NAME = "core-pwa-v1";
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
  // Ignora requisições de API e autenticação — sempre busca da rede
  if (
    e.request.url.includes("/api/") ||
    e.request.url.includes("supabase.co") ||
    e.request.method !== "GET"
  ) {
    return e.respondWith(fetch(e.request));
  }

  // Para assets estáticos: cache first
  e.respondWith(
    caches.match(e.request).then((cached) => {
      return cached || fetch(e.request).then((response) => {
        // Salva novos recursos estáticos no cache
        if (response.ok && e.request.url.startsWith(self.location.origin)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return response;
      });
    })
  );
});
