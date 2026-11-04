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
      className="glass-strong fixed left-1/2 -translate-x-1/2 z-50 rounded-full px-5 py-3 text-[14px] font-semibold text-[var(--text-primary)] pointer-events-none"
      style={{
        // Floats above the disclaimer banner when it is present.
        // --disclaimer-banner-h is set by DisclaimerBanner and defaults to 0px.
        bottom: "calc(var(--disclaimer-banner-h, 0px) + 24px)",
        boxShadow: "0 8px 24px var(--glow)",
      }}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
