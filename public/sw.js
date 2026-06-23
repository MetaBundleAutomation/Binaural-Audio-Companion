// Binaural Audio Companion — Service Worker
// Strategy:
//   /_next/static/ assets    → cache-first   (content-hashed, safe to cache forever)
//   audio + video (.mp3/.mp4) → cache-first, Range-aware (full offline; builds 206
//                               partial responses from the cached file so iOS video
//                               playback and seeking work with no network)
//   navigation requests       → network-first, cache fallback (works offline)
//   everything else           → network-first, cache fallback
//
// On install we PRECACHE the app shell + every file-based sound + the loop videos,
// so the whole app — including Heavy Rain, Gentle Rainforest Waterfall and Gentle
// Ocean Waves — works fully offline from the first launch. (White / Pink / Brown /
// Green noise, Pure Tone and the binaural beats are generated in-browser, so they
// need no network at all.)

// ── Cache version ─────────────────────────────────────────────────────────────
// BUMP THIS on every release that changes cached assets. Renaming the cache makes
// the SW delete all older caches on activate, so returning users get fresh files.
// Also version a file's URL when its bytes change (e.g. heavy-rain.mp3 →
// heavy-rain-v2.mp3, or ?v=N): a brand-new URL can never be served from an old cache.
const CACHE = "crux-v10";

// Small, critical assets — the app shell, the file-based sounds, and the posters.
// Cached on install so every sound works offline immediately.
const CORE_PRECACHE = [
  "/",
  "/about",
  "/instructions",
  "/settings",
  "/disclaimer",
  "/crux-icon-512.png",
  // File-based sounds (white/pink/brown/green noise, Pure Tone and the beats are
  // generated in-browser, so only these recordings need precaching).
  "/audio/heavy-rain-v2.mp3",
  "/audio/running-water.mp3",
  "/audio/gentle-ocean-waves.mp3",
  "/audio/Box%20Breathing.mp3?v=10",
  "/audio/box-breathing-sarah.mp3?v=1",
  "/audio/box-breathing-john.mp3?v=1",
  "/audio/box-breathing-julie.mp3?v=1",
  // Video poster frames (shown before the loop plays / while it buffers).
  "/video/running-water-loop-poster.jpg",
  "/video/gentle-waves-on-tropical-beach-loop-poster.jpg",
];

// Large loop videos — precached in the background so activation isn't blocked on
// ~45 MB. Best-effort: a failure here never breaks the install or the core cache.
const MEDIA_PRECACHE = [
  "/video/running-water-loop.mp4",
  "/video/gentle-waves-on-tropical-beach-loop.mp4",
];

const MEDIA_RE = /\.(mp4|webm|mov|mp3|m4a|wav|ogg|aac)$/i;

// ── Install: pre-cache the shell + sounds, then the videos in the background ─────
self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Resilient precache: one bad URL won't abort the rest (unlike cache.addAll).
    await Promise.allSettled(CORE_PRECACHE.map((url) => cache.add(url)));
    // Core (shell + sounds) is ready — activate immediately.
    self.skipWaiting();
    // Big videos finish caching in the background; waitUntil keeps the worker alive
    // until they're done, but the activation above isn't blocked on them.
    await Promise.allSettled(MEDIA_PRECACHE.map((url) => cache.add(url)));
  })());
});

// ── Activate: delete stale caches from previous SW versions, take control ────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

// ── Media (audio/video): cache-first, Range-aware ───────────────────────────────
// Serves the cached full file. For a Range request (video elements, iOS seeking) it
// builds a 206 Partial Content response from the cached bytes, so playback works
// with no network. Cache misses are fetched in full (a cacheable 200) and stored.
async function serveMedia(request) {
  const cache = await caches.open(CACHE);
  const key = request.url; // match by URL string so the Range header is ignored
  let full = await cache.match(key);

  if (!full) {
    try {
      // Fetch the WHOLE file (a bare GET, no Range) so we store a complete 200.
      const fresh = await fetch(key);
      if (fresh && fresh.status === 200) {
        cache.put(key, fresh.clone());
        full = fresh;
      } else {
        return fresh; // non-200 (e.g. 404) — pass through, never cache
      }
    } catch {
      return new Response("", { status: 504, statusText: "Offline (not cached)" });
    }
  }

  const range = request.headers.get("range");
  if (!range) return full;

  // Build a 206 partial response from the cached full body.
  const buf = await full.arrayBuffer();
  const size = buf.byteLength;
  const m = /^bytes=(\d*)-(\d*)/.exec(range);
  let start = m && m[1] !== "" ? parseInt(m[1], 10) : 0;
  let end = m && m[2] !== "" ? parseInt(m[2], 10) : size - 1;
  if (!Number.isFinite(start)) start = 0;
  if (!Number.isFinite(end) || end > size - 1) end = size - 1;
  if (start > end || start >= size) {
    return new Response(null, {
      status: 416,
      statusText: "Range Not Satisfiable",
      headers: { "Content-Range": `bytes */${size}` },
    });
  }
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    statusText: "Partial Content",
    headers: {
      "Content-Type": full.headers.get("Content-Type") || "application/octet-stream",
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Accept-Ranges": "bytes",
      "Content-Length": String(end - start + 1),
    },
  });
}

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests from the same origin
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Skip Next.js HMR and API routes (API must always be fresh)
  if (url.pathname.startsWith("/_next/webpack-hmr")) return;
  if (url.pathname.startsWith("/api/")) return;

  // ── Audio + video — cache-first, Range-aware (full offline support) ─────────
  if (MEDIA_RE.test(url.pathname)) {
    event.respondWith(serveMedia(request));
    return;
  }

  // ── Static assets (/_next/static/) — cache-first (content-hashed) ───────────
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

  // ── Navigation and everything else — network-first, cache fallback ──────────
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) => cached ?? caches.match("/"))
      )
  );
});
