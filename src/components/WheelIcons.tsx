// Icons for the CRUX Wheel spokes. Kept separate from NavIcons.tsx so the
// existing CRUX navigation is untouched (hard rule: add the wheel, don't change
// CRUX). Same 24-unit stroke grid as the nav icons so the two styles match.

import type { ReactNode } from "react";

export type WheelIconName =
  | "food"
  | "movement"
  | "sleep"
  | "mind"
  | "body"
  | "supplements"
  | "treatments"
  | "connection";

const PATHS: Record<WheelIconName, ReactNode> = {
  // Bowl of food with a little steam
  food: (
    <>
      <path d="M3.5 11.5h17a8.5 8.5 0 0 1-17 0z" />
      <path d="M2.5 11.5h19" />
      <path d="M10 8c0-1.2 1-1.2 1-2.4M14 8c0-1.2 1-1.2 1-2.4" />
    </>
  ),
  // Walking figure — small steps
  movement: (
    <>
      <circle cx="13.5" cy="4" r="2" />
      <path d="M13 7l-1.5 5 2.5 2.5V20" />
      <path d="M11.5 12l-3.5 1.2" />
      <path d="M14 14.5l3 1.4" />
    </>
  ),
  // Sun rising over the horizon — morning light / body clock
  sleep: (
    <>
      <path d="M4 18h16" />
      <path d="M8 18a4 4 0 0 1 8 0" />
      <path d="M12 6v2M6 9.5l1.4 1.4M18 9.5l-1.4 1.4M3.5 14h2M18.5 14h2" />
    </>
  ),
  // Head with a gentle swirl — mind & stress
  mind: (
    <>
      <path d="M9 19.5v-2.2a6 6 0 1 1 6 0v2.2z" />
      <path d="M10.4 10.2a1.8 1.8 0 0 1 3.2 1c0 1.3-1.6 1.4-1.6 2.6" />
    </>
  ),
  // Standing figure, arms out — body & movement/posture
  body: (
    <>
      <circle cx="12" cy="4.5" r="2" />
      <path d="M12 7v6" />
      <path d="M7 9.5h10" />
      <path d="M12 13l-3 7M12 13l3 7" />
    </>
  ),
  // Capsule / pill — supplements
  supplements: (
    <>
      <rect x="3" y="9" width="18" height="6" rx="3" />
      <path d="M12 9v6" />
    </>
  ),
  // Plus in a circle — getting help
  treatments: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  // Two people — connection & support
  connection: (
    <>
      <circle cx="9" cy="9" r="2.5" />
      <circle cx="15.5" cy="9.5" r="2" />
      <path d="M4 18.5a5 5 0 0 1 10 0" />
      <path d="M14.5 18.5a4.5 4.5 0 0 1 5.5-2" />
    </>
  ),
};

export default function WheelIcon({
  name,
  className = "h-6 w-6",
}: {
  name: WheelIconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
