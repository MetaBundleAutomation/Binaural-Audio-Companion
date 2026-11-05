"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import BoxBreathing from "./BoxBreathing";
import CoherenceBreathing from "./CoherenceBreathing";

type Mode = "box" | "coherence";

/**
 * The Breathing page: Box Breathing and Heart–Brain Coherence behind one
 * tab switch. Only one of the two is mounted at a time, so switching tabs
 * ends the other session the way it always has.
 *
 * `/breathe#coherence-breathing` opens on the Coherence tab (the Instructions
 * page links there). That hash is only read, never used as an element id here:
 * this component stays mounted, hidden, on every other page, and the
 * Instructions page has its own `coherence-breathing` section. Two elements
 * with one id send the "Instructions" buttons to the hidden copy.
 */
export default function BreathingHost({
  onRunningChange,
}: {
  onRunningChange?: (running: boolean) => void;
}) {
  const [mode, setMode] = useState<Mode>("box");

  // The hash is read each time the Breathing page is shown. A link from another
  // page moves here without a `hashchange` event, and this component is already
  // mounted by then, so reading it once on mount is not enough. It is ignored on
  // other pages, where `#coherence-breathing` means a section of Instructions.
  const pathname = usePathname();
  useEffect(() => {
    if (pathname !== "/breathe") return;
    const fromHash = () => {
      if (window.location.hash === "#coherence-breathing") setMode("coherence");
      else if (window.location.hash === "#box-breathing") setMode("box");
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [pathname]);

  // Switching tabs unmounts the running tool, so report "not running".
  useEffect(() => {
    onRunningChange?.(false);
  }, [mode, onRunningChange]);

  return (
    <div id="breathing-tool" className="pt-8">
      <div className="flex justify-center mb-4">
        <div role="group" aria-label="Breathing mode" className="flex p-1 rounded-full glass">
          {(["box", "coherence"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={`px-5 py-2 rounded-full border text-sm font-semibold transition-all cursor-pointer ${
                mode === m
                  ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] text-[var(--text-primary)]"
                  : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {m === "box" ? "Box Breathing" : "Coherence"}
            </button>
          ))}
        </div>
      </div>
      <div className="breathing-card-host">
        {mode === "box" ? (
          <BoxBreathing onRunningChange={onRunningChange} />
        ) : (
          <CoherenceBreathing onRunningChange={onRunningChange} />
        )}
      </div>
    </div>
  );
}
