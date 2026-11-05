"use client";

import { useState } from "react";
import { BRAIN_PARTS, type BrainPartId } from "@/data/brainParts";

// A real medical illustration (Blausen 0614, CC BY) with four parts marked.
export default function BrainMap() {
  const [active, setActive] = useState<BrainPartId | null>(null);
  const activePart = BRAIN_PARTS.find((p) => p.id === active);

  return (
    <div className="my-6">
      <div className="relative w-full max-w-[400px] mx-auto">
        <img
          src="/Images/limbic-system.png"
          alt="A side view of the brain showing the limbic system, with the smoke alarm, filing clerk, calm supervisor and phone line marked"
          width={1240}
          height={1061}
          loading="lazy"
          decoding="async"
          className="w-full h-auto block"
        />

        {/* Pointer that lights up on the photo when a card is tapped */}
        {BRAIN_PARTS.map((part) => {
          const isActive = active === part.id;
          return (
            <span
              key={part.id}
              aria-hidden="true"
              className="absolute pointer-events-none"
              style={{
                left: `${part.pos.x}%`,
                top: `${part.pos.y}%`,
                transform: "translate(-50%, -50%)",
                width: 40,
                height: 40,
                opacity: isActive ? 1 : 0,
                transition: "opacity 0.2s",
              }}
            >
              <span
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: part.color, opacity: 0.45 }}
              />
              <span
                className="absolute rounded-full"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 22,
                  height: 22,
                  border: `3px solid ${part.color}`,
                  boxShadow: "0 0 0 2px white, 0 2px 6px rgba(0,0,0,0.5)",
                }}
              />
            </span>
          );
        })}
      </div>

      <p className="text-center text-[13px] text-[var(--text-secondary)] mt-2 mb-1">
        Tap a part below — it’ll light up on the picture too
      </p>
      <p className="text-center text-[12px] text-[var(--text-secondary)] mb-4">
        Illustration: “Blausen 0614 - Limbic system” by Blausen.com staff (2014), CC BY, via Medical gallery of Blausen Medical 2014
      </p>

      {/* Legend — the tap targets. One column on a phone. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {BRAIN_PARTS.map((part) => {
          const isActive = active === part.id;
          return (
            <button
              key={part.id}
              onClick={() => setActive(isActive ? null : part.id)}
              aria-pressed={isActive}
              className={`card flex items-center gap-3 px-4 py-3 text-left transition-all cursor-pointer ${
                isActive
                  ? "bg-[color-mix(in_srgb,var(--primary)_12%,transparent)]"
                  : "border-[var(--border-color)] bg-[var(--background-light)] hover:border-[var(--primary-light)]"
              }`}
              style={isActive ? { borderColor: part.color } : undefined}
            >
              <span
                className="w-4 h-4 rounded-full shrink-0"
                style={{ background: part.color }}
                aria-hidden="true"
              />
              <span className="min-w-0">
                <span className="block text-[15px] font-semibold leading-snug text-[var(--text-primary)]">
                  {part.nickname}
                </span>
                <span className="block text-[12px] leading-snug text-[var(--text-secondary)]">
                  {part.realName}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Detail card — what it does, and where it is on your own head */}
      {activePart && (
        <div
          className="card mt-4 px-6 py-5"
          style={{ borderColor: activePart.color }}
        >
          <div className="flex items-baseline justify-between gap-4 mb-3">
            <div className="text-[17px] font-semibold tracking-tight text-[var(--text-primary)]">
              {activePart.nickname}
            </div>
            <button
              onClick={() => setActive(null)}
              className="btn-ghost shrink-0"
              aria-label="Close"
            >
              Close
            </button>
          </div>

          <p className="text-[15px] leading-relaxed text-[var(--text-primary)] mb-4">
            {activePart.job}
          </p>

          <div className="pt-3 border-t border-[var(--border-color)]">
            <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)] mb-1.5">
              Where it is on you
            </div>
            <p className="text-[15px] leading-relaxed text-[var(--text-primary)]">
              {activePart.where}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}