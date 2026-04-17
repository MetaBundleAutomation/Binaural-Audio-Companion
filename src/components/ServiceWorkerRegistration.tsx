"use client";

import { useEffect } from "react";

// Registers the service worker on first load.
// Rendered once in the root layout — renders nothing visible.
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch(() => {
        // SW registration is a progressive enhancement — silently ignore failures.
      });
  }, []);

  return null;
}
