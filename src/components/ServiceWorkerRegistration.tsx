"use client";

import { useEffect } from "react";

// Registers the service worker — but only in production.
//
// In development the SW caches pages and assets aggressively and serves stale
// versions while you iterate, so here we do the opposite: unregister any
// existing SW and clear its caches so dev always reflects the latest output.
// Rendered once in the root layout — renders nothing visible.
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      // Dev: tear down any service worker + caches so nothing is served stale.
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => regs.forEach((r) => r.unregister()))
        .catch(() => {});
      if (typeof caches !== "undefined") {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {});
      }
      return;
    }

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch(() => {
        // SW registration is a progressive enhancement — silently ignore failures.
      });
  }, []);

  return null;
}
