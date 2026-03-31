self.addEventListener("install", (e) => {
  console.log("[Service Worker] Install");
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  console.log("[Service Worker] Activate");
  return self.clients.claim();
});

// self.addEventListener("fetch", (e) => {
//   // Pass-through fetch (no caching for dynamic NextJS app atm)
//   e.respondWith(fetch(e.request));
// });
