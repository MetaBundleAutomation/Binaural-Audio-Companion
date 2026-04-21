"use client";

import { useEffect, useState } from "react";

/**
 * Zero-dependency, self-dismissing toast.
 *
 * Fire from anywhere:
 *   window.dispatchEvent(new CustomEvent("crux:toast", { detail: "Your message" }))
 *
 * Rendered once inside <PreferencesProvider> in layout.tsx.
 */
export default function Toast() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    function handler(e: Event) {
      // Guard: only accept genuine CustomEvents with a string payload to
      // prevent injected events from rendering unexpected content.
      if (!(e instanceof CustomEvent) || typeof e.detail !== "string") return;
      const msg = e.detail.trim();
      if (!msg) return;
      setMessage(msg);
      clearTimeout(timer);
      timer = setTimeout(() => setMessage(null), 2000);
    }

    window.addEventListener("crux:toast", handler);
    return () => {
      window.removeEventListener("crux:toast", handler);
      clearTimeout(timer);
    };
  }, []);

  if (!message) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full text-white text-[14px] font-semibold pointer-events-none"
      style={{ background: "var(--primary)", boxShadow: "0 8px 24px rgba(43,107,127,0.45)" }}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
