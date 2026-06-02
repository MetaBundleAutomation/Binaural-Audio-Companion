# Binaural Audio Companion

## Repository

- **GitHub**: https://github.com/MetaBundleAutomation/Binaural-Audio-Companion
- **Organization**: MetaBundleAutomation

## Project Overview

Binaural Audio Companion - a project under MetaBundle Automation.

## Caching conventions

A service worker (`public/sw.js`) caches the app in production for speed and
offline use. It is **disabled in development** (`ServiceWorkerRegistration`
registers it only when `NODE_ENV === "production"` and tears down any existing
worker + caches in dev), so previews always reflect the latest output.

To avoid serving stale assets in production:

- **Bump the SW cache version** — `CACHE = "crux-vN"` in `public/sw.js` — on any
  release that changes cached assets. Renaming the cache purges older caches on
  activate, so returning users get fresh files.
- **Version audio filenames when their content changes** — e.g.
  `heavy-rain.mp3` → `heavy-rain-v2.mp3`, or append `?v=N` (as
  `Box Breathing.mp3?v=9` does). A brand-new URL can never be served from an old
  cache. (Code/CSS get this automatically via Next's content-hashed
  `/_next/static/` filenames.)
