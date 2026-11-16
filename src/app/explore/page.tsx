import Link from "next/link";
import type { Metadata } from "next";
import WheelIcon, { type WheelIconName } from "@/components/WheelIcons";
import { SPOKES, WHEEL_LABEL, WHEEL_DRAFT_NOTICE } from "@/lib/wheel";

export const metadata: Metadata = {
  title: `${WHEEL_LABEL} — CRUX`,
  description: "Practical, science-backed health topics for veterans. A draft for doctor review.",
};

// The wheel is a ring of eight spokes around CRUX. Positions are worked out
// once, here, from each spoke's place in the circle: top, then clockwise.
// RADIUS is a percentage of the square's half-width.
const RADIUS = 37;
const START_ANGLE = -90; // degrees; -90 puts the first spoke at the top

function pointAt(index: number, count: number, radius = RADIUS) {
  const angle = ((START_ANGLE + (index * 360) / count) * Math.PI) / 180;
  return {
    x: 50 + radius * Math.cos(angle),
    y: 50 + radius * Math.sin(angle),
  };
}

export default function ExplorePage() {
  return (
    <main className="min-h-screen px-5 pt-12 pb-20 md:pt-16">
      <div className="max-w-2xl mx-auto text-center">
        <span className="eyebrow">{WHEEL_DRAFT_NOTICE}</span>
        <h1 className="mt-6 text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
          {WHEEL_LABEL}
        </h1>
        <p className="mt-4 text-pretty text-base sm:text-lg leading-relaxed text-[var(--text-secondary)]">
          Plain-English, science-backed health topics. Tap a spoke to open it, or
          tap CRUX in the middle to go back to the calm tools.
        </p>
      </div>

      {/* The wheel. A square box; CRUX sits at the centre, spokes on the ring. */}
      <div className="relative mx-auto mt-10 aspect-square w-[min(92vw,540px)]">
        {/* Faint ring and spokes-to-centre lines, purely decorative. */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke="var(--border-color)"
            strokeWidth="0.4"
          />
          {SPOKES.map((spoke, i) => {
            const p = pointAt(i, SPOKES.length);
            return (
              <line
                key={spoke.id}
                x1="50"
                y1="50"
                x2={p.x}
                y2={p.y}
                stroke="var(--border-color)"
                strokeWidth="0.4"
              />
            );
          })}
        </svg>

        {/* CRUX centre — tap to return to the calm home. */}
        <Link
          href="/"
          aria-label="Return to the CRUX home and the calm tools"
          className="group absolute left-1/2 top-1/2 z-10 flex h-24 w-24 sm:h-28 sm:w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full text-center text-[var(--on-accent)] shadow-lg transition-transform duration-300 motion-safe:group-hover:scale-105"
          style={{ background: "var(--btn-primary-bg)" }}
        >
          <span className="text-xl sm:text-2xl font-bold tracking-tight">CRUX</span>
          <span className="mt-0.5 text-[10px] sm:text-[11px] font-medium opacity-90">
            Back to calm
          </span>
        </Link>

        {/* The eight spokes. */}
        <nav aria-label="Explore topics" className="absolute inset-0">
          <ul className="list-none">
            {SPOKES.map((spoke, i) => {
              const p = pointAt(i, SPOKES.length);
              return (
                <li
                  key={spoke.id}
                  className="absolute"
                  style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%, -50%)" }}
                >
                  <Link
                    href={`/explore/${spoke.id}`}
                    aria-label={`${spoke.label}: ${spoke.description}`}
                    className="group flex w-[88px] sm:w-[104px] flex-col items-center gap-1.5 text-center"
                  >
                    <span
                      className="grid h-14 w-14 sm:h-16 sm:w-16 place-items-center rounded-full border text-[var(--primary)] shadow-lg transition-transform duration-300 motion-safe:group-hover:scale-110 motion-safe:group-focus-visible:scale-110"
                      style={{ background: "var(--surface-solid)", borderColor: "var(--border-color)" }}
                    >
                      <WheelIcon name={spoke.id as WheelIconName} className="h-6 w-6 sm:h-7 sm:w-7" />
                    </span>
                    <span className="text-[12px] sm:text-[13px] font-semibold leading-tight text-[var(--text-primary)]">
                      {spoke.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Safety link + a note that more is planned. */}
      <div className="mx-auto mt-12 flex max-w-2xl flex-col items-center gap-4 text-center">
        <Link href="/crisis" className="btn-secondary">
          Need to talk to someone now?
        </Link>
        <p className="text-sm text-[var(--text-secondary)]">
          More topics are being added as the doctor reviews them.
        </p>
      </div>
    </main>
  );
}
