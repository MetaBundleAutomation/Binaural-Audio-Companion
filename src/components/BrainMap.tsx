"use client";

import { useState } from "react";

// A real medical illustration (Blausen 0614, CC BY) with four parts marked.
// Each part's position is given as a % of the image's width/height, so the
// marker lands in the right spot no matter what size the image is shown at.
const PARTS = [
  {
    id: "alarm",
    nickname: "The smoke alarm",
    realName: "Amygdala",
    job: "Spots danger fast. Doesn't think — just goes off.",
    where:
      "Put two fingers on your temple, just in front of your ear. It's in about that deep — and it's roughly the size of an almond.",
    color: "#C97B5A",
    pos: { x: 38.9, y: 60.0 },
  },
  {
    id: "clerk",
    nickname: "The filing clerk",
    realName: "Hippocampus",
    job: "Stamps memories with a date and a place, so you know that was then.",
    where:
      "Just behind the alarm and a little lower, curled around it. Same depth — about level with your ear.",
    color: "#4BA8BD",
    pos: { x: 61.1, y: 52.1 },
  },
  {
    id: "supervisor",
    nickname: "The calm supervisor",
    realName: "Prefrontal cortex",
    job: "Plans, weighs things up, and turns the alarm down. Goes quiet under stress.",
    where:
      "Flat of your hand on your forehead. It's right there behind it — the front of the brain, closest to the world.",
    color: "#4FA98C",
    pos: { x: 12.9, y: 38.1 },
  },
  {
    id: "line",
    nickname: "The phone line",
    realName: "Cingulum",
    job: "The wiring that lets the other three talk to each other.",
    where:
      "Running over the top, front to back — roughly under where a cap's seam would sit. It joins the other three together.",
    color: "#8C9BAA",
    pos: { x: 42.9, y: 23.5 },
  },
] as const;

type PartId = (typeof PARTS)[number]["id"];

export default function BrainMap() {
  const [active, setActive] = useState<PartId | null>(null);
  const activePart = PARTS.find((p) => p.id === active);

  return (
    <div className="my-6">
      <div className="relative w-full max-w-[400px] mx-auto">
        <img
          src="/Images/limbic-system.png"
          alt="A side view of the brain showing the limbic system, with the smoke alarm, filing clerk, calm supervisor and phone line marked"
          className="w-full h-auto block"
        />

        {/* Pointer that lights up on the photo when a card is tapped */}
        {PARTS.map((part) => {
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
        Tap a part below — it'll light up on the picture too
      </p>
      <p className="text-center text-[10px] text-[var(--text-secondary)] opacity-70 mb-4">
        Illustration: "Blausen 0614 - Limbic system" by Blausen.com staff (2014), CC BY, via Medical gallery of Blausen Medical 2014
      </p>

      {/* Legend — the tap targets. One column on a phone. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {PARTS.map((part) => {
          const isActive = active === part.id;
          return (
            <button
              key={part.id}
              onClick={() => setActive(isActive ? null : part.id)}
              aria-pressed={isActive}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left border-2 transition-all cursor-pointer ${
                isActive
                  ? "bg-[var(--background-card)]"
                  : "border-[var(--border-color)] bg-[var(--background-card)] hover:border-[var(--primary-light)]"
              }`}
              style={isActive ? { borderColor: part.color } : undefined}
            >
              <span
                className="w-4 h-4 rounded-full shrink-0"
                style={{ background: part.color }}
                aria-hidden="true"
              />
              <span className="min-w-0">
                <span className="block text-[15px] font-bold text-[var(--text-primary)] truncate">
                  {part.nickname}
                </span>
                <span className="block text-[11px] text-[var(--text-secondary)] truncate">
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
          className="mt-4 rounded-2xl px-6 py-5 border-2 bg-[var(--background-light)]"
          style={{ borderColor: activePart.color }}
        >
          <div className="flex items-baseline justify-between gap-4 mb-3">
            <div className="text-[17px] font-bold text-[var(--text-primary)]">
              {activePart.nickname}
            </div>
            <button
              onClick={() => setActive(null)}
              className="shrink-0 text-[13px] font-semibold text-[var(--text-secondary)] hover:text-[var(--primary)] transition-all cursor-pointer"
              aria-label="Close"
            >
              Close
            </button>
          </div>

          <p className="text-[15px] leading-relaxed text-[var(--text-primary)] mb-4">
            {activePart.job}
          </p>

          <div className="pt-3 border-t border-[var(--border-color)]">
            <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1.5">
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