"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "crux_disclaimer_dismissed";

// Height in px — mirrored as a CSS variable so Toast floats above the banner.
const BANNER_H = 56;

export default function DisclaimerBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setVisible(true);
        document.documentElement.style.setProperty(
          "--disclaimer-banner-h",
          `${BANNER_H}px`,
        );
      }
    } catch {
      /* localStorage unavailable — skip banner */
    }
  }, []);

  function dismiss() {
    setVisible(false);
    document.documentElement.style.setProperty("--disclaimer-banner-h", "0px");
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* noop */
    }
  }

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between gap-4 px-5 border-t border-[var(--border-color)] bg-[var(--background-card)]"
      style={{ height: BANNER_H }}
      role="note"
      aria-label="Wellness disclaimer"
    >
      <p className="text-[13px] text-[var(--text-secondary)] leading-snug">
        CRUX is a wellness tool, not medical advice. Not for use while driving or
        operating machinery.{" "}
        <Link
          href="/disclaimer"
          className="underline text-[var(--primary)] hover:opacity-75 whitespace-nowrap"
        >
          Learn more
        </Link>
      </p>
      <button
        onClick={dismiss}
        className="shrink-0 px-4 py-1.5 rounded-full border border-[var(--border-color)] text-[13px] font-semibold text-[var(--text-primary)] hover:border-[var(--primary)] transition-all cursor-pointer"
        aria-label="Dismiss disclaimer"
      >
        Got it
      </button>
    </div>
  );
}
