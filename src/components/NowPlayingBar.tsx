"use client";

import Link from "next/link";
import NavIcon from "@/components/NavIcons";

const NOISE_LABELS: Record<string, string> = {
  white: "White noise",
  pink: "Pink noise",
  brown: "Brown noise",
  green: "Green noise",
  heavyrain: "Heavy rain",
  runningwater: "Rainforest waterfall",
  oceanwaves: "Ocean waves",
  puretone: "Pure tone",
};

export interface NowPlaying {
  binaural: string | null;   // track name
  noise: string | null;      // sound key
  breathing: boolean;
  bodyScan: boolean;
}

/**
 * A small fixed bar that appears on any page other than the one the sound
 * belongs to, so people always know what is running and can get back to its
 * controls in one tap. Status only: the controls stay on the tool's own page.
 */
export default function NowPlayingBar({
  pathname,
  playing,
}: {
  pathname: string;
  playing: NowPlaying;
}) {
  const chips: { href: string; label: string; icon: "headphones" | "waves" | "wind" | "body" }[] = [];
  if (playing.binaural && pathname !== "/binaural")
    chips.push({ href: "/binaural", label: playing.binaural, icon: "headphones" });
  if (playing.noise && pathname !== "/noise")
    chips.push({ href: "/noise", label: NOISE_LABELS[playing.noise] ?? "Noise", icon: "waves" });
  if (playing.breathing && pathname !== "/breathe")
    chips.push({ href: "/breathe", label: "Breathing", icon: "wind" });
  if (playing.bodyScan && pathname !== "/body-scan")
    chips.push({ href: "/body-scan", label: "Body scan", icon: "body" });

  if (chips.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-40 flex justify-center px-3 lg:left-60"
      style={{ bottom: "calc(var(--disclaimer-banner-h, 0px) + 12px)" }}
      role="status"
      aria-live="polite"
    >
      <div className="glass-strong pointer-events-auto flex max-w-full items-center gap-2 overflow-x-auto rounded-full px-3 py-2 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.8)]">
        <span className="flex shrink-0 items-center gap-2 pl-1 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
          <span
            className="h-1.5 w-1.5 rounded-full bg-[var(--accent-2)]"
            style={{ boxShadow: "0 0 8px var(--accent-2)" }}
            aria-hidden="true"
          />
          Now playing
        </span>
        {chips.map((chip) => (
          <Link
            key={chip.href}
            href={chip.href}
            className="flex shrink-0 items-center gap-2 rounded-full border border-[var(--border-color)] bg-white/[0.04] px-3 py-1.5 text-[13px] font-semibold text-[var(--text-primary)] transition-colors hover:border-[var(--primary)]"
          >
            <NavIcon name={chip.icon} className="h-4 w-4 text-[var(--accent-2)]" />
            {chip.label}
            <NavIcon name="arrow" className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
          </Link>
        ))}
      </div>
    </div>
  );
}
