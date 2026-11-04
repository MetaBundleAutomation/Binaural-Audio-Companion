"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getPairing } from "@/data/aromatherapy";
import type { AromaPairing } from "@/data/aromatherapy";

interface AromatherapyCardProps {
  trackName: string;
}

export default function AromatherapyCard({ trackName }: AromatherapyCardProps) {
  const [displayed, setDisplayed] = useState<AromaPairing>(getPairing(trackName));
  const [fading, setFading]       = useState(false);

  useEffect(() => {
    const next = getPairing(trackName);
    if (next.oil === displayed.oil && next.hint === displayed.hint) return;
    setFading(true);
    const t = setTimeout(() => {
      setDisplayed(next);
      setFading(false);
    }, 180);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackName]);

  return (
    <div
      className="card mx-auto mb-6 px-6 py-5 flex flex-col items-center text-center gap-3"
      style={{
        maxWidth:        400,
        boxShadow:       "var(--shadow)",
      }}
    >
      {/* Leaf icon */}
      <span className="text-2xl leading-none shrink-0" aria-hidden="true">🌿</span>

      {/* Text content */}
      <div className="flex flex-col items-center text-center">
        <span className="eyebrow mb-3">Aromatherapy pairing</span>

        {/* Oil name — fades between tracks */}
        <p
          className="text-[17px] font-semibold tracking-tight text-[var(--text-primary)] leading-snug"
          style={{
            opacity:    fading ? 0 : 1,
            transition: "opacity 0.18s ease",
          }}
        >
          {displayed.oil}
        </p>

        {/* Hint — fades with oil name */}
        <p
          className="text-[14px] text-[var(--text-secondary)] mt-1 leading-relaxed"
          style={{
            opacity:    fading ? 0 : 1,
            transition: "opacity 0.18s ease",
          }}
        >
          {displayed.hint}
        </p>
      </div>

      <Link
        href="/instructions#aromatherapy"
        className="btn-ghost"
      >
        <svg
          viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className="w-4 h-4"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
        Tap to learn about Aromatherapy
      </Link>

    </div>
  );
}
