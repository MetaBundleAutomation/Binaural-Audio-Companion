// Binaural Audio Companion — Service Worker
// Strategy:
//   /_next/static/ assets  → cache-first   (content-hashed, safe to cache forever)
//   navigation requests    → network-first, cache fallback (works offline)
//   everything else        → network-first, cache fallback

const CACHE = "crux-v1";
const PRECACHE = ["/", "/about"];

// ── Install: pre-cache the app shell ──────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE))
  );
  // Activate immediately — no need to wait for old tabs to close
  self.skipWaiting();
});

// ── Activate: delete stale caches from previous SW versions ──────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))
      )
    )
  );
  // Take control of all open pages immediately
  self.clients.claim();
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests from the same origin
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Skip Next.js internal routes and analytics
  if (url.pathname.startsWith("/_next/webpack-hmr")) return;

  // ── Static assets (/_next/static/) — cache-first ──────────────────────────
  // These filenames include a content hash, so they are safe to serve forever.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }

  // ── Navigation and everything else — network-first, cache fallback ─────────
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Only cache successful responses
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() =>
        // Offline fallback: serve cached version, or the cached home page
        caches.match(request).then((cached) => cached ?? caches.match("/"))
      )
  );
});
