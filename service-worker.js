const CACHE_NAME = 'wochenbericht-v1';
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Cache-first fuer die App-Huelle und die PDF-Bibliotheken, Netzwerk-first
// (mit Cache-Fallback) fuer alles andere (z.B. OpenStreetMap-Adressabfragen,
// die ohnehin online passieren muessen).
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const isPrecached = PRECACHE_URLS.some((u) => req.url.endsWith(u.replace('./', '')) || req.url === u);

  if (isPrecached) {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req))
    );
    return;
  }

  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});
