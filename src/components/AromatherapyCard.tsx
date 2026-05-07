"use client";

import React, { useEffect, useState } from "react";
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
      className="mx-auto mb-6 rounded-2xl border border-[var(--border-color)] px-5 py-4 flex items-start gap-4"
      style={{
        maxWidth:        500,
        background:      "var(--background-card)",
        boxShadow:       "0 2px 12px rgba(0,0,0,0.18)",
      }}
    >
      {/* Leaf icon */}
      <span className="text-2xl leading-none mt-0.5 shrink-0" aria-hidden="true">🌿</span>

      {/* Text content */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--text-secondary)] mb-1">
          Aromatherapy pairing
        </p>

        {/* Oil name — fades between tracks */}
        <p
          className="text-base font-semibold text-[var(--text-primary)] leading-snug"
          style={{
            opacity:    fading ? 0 : 1,
            transition: "opacity 0.18s ease",
          }}
        >
          {displayed.oil}
        </p>

        {/* Hint — fades with oil name */}
        <p
          className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed"
          style={{
            opacity:    fading ? 0 : 1,
            transition: "opacity 0.18s ease",
          }}
        >
          {displayed.hint}
        </p>
      </div>

    </div>
  );
}
