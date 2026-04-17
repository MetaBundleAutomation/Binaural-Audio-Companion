export interface Track {
  name: string;
  description: string;
  duration: string;
  binauralFreq: number;
  icon: string;
  /** Hex colour representing this beat — used for card gradients and player tint */
  color: string;
  /** Seconds from end at which the track begins to fade to silence */
  fadeOutDuration?: number;
}

export const tracks: Track[] = [
  {
    name: "Focus",
    description:
      "15 Minutes of 25 Hz Beta waves for deep concentration — fades gently over the final 5 minutes",
    duration: "15:00",
    binauralFreq: 25,
    icon: "focus",
    color: "#4B4A6B",
    fadeOutDuration: 300,
  },
  {
    name: "Calm",
    description:
      "15 Minutes of 12 Hz Alpha waves for relaxing the mind — fades gently over the final 5 minutes",
    duration: "15:00",
    binauralFreq: 12,
    icon: "calm",
    color: "#4A6B7C",
    fadeOutDuration: 300,
  },
  {
    name: "Sleep",
    description:
      "15 Minutes of 4 Hz Delta waves for deep sleep — fades gently over the final 5 minutes",
    duration: "15:00",
    binauralFreq: 4,
    icon: "sleep",
    color: "#3B5C6B",
    fadeOutDuration: 300,
  },
  {
    name: "Creativity",
    description:
      "15 Minutes of 8 Hz Alpha waves for exploring creativity — fades gently over the final 5 minutes",
    duration: "15:00",
    binauralFreq: 8,
    icon: "creativity",
    color: "#7C5A47",
    fadeOutDuration: 300,
  },
  {
    name: "Energy",
    description:
      "15 Minutes of 30 Hz Beta waves for exercise and mental alertness — fades gently over the final 5 minutes",
    duration: "15:00",
    binauralFreq: 30,
    icon: "energy",
    color: "#8B5E47",
    fadeOutDuration: 300,
  },
  {
    name: "Meditation",
    description:
      "15 Minutes of 6 Hz Theta waves for staying in the present with daily mindfulness — fades gently over the final 5 minutes",
    duration: "15:00",
    binauralFreq: 6,
    icon: "meditation",
    color: "#4A6070",
    fadeOutDuration: 300,
  },
  {
    name: "Learning",
    description:
      "15 Minutes of 10 Hz Alpha waves for attention and memory — fades gently over the final 5 minutes",
    duration: "15:00",
    binauralFreq: 10,
    icon: "learning",
    color: "#506B5A",
    fadeOutDuration: 300,
  },
  {
    name: "Anxiety",
    description:
      "15 Minutes of 8 Hz Alpha waves for calming the mind and relieving stress — fades gently over the final 5 minutes",
    duration: "15:00",
    binauralFreq: 8,
    icon: "anxiety",
    color: "#5E7461",
    fadeOutDuration: 300,
  },
];

export function parseDuration(duration: string): number {
  const [minutes, seconds] = duration.split(":").map(Number);
  return minutes * 60 + (seconds || 0);
}

export function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Lightens a hex colour by blending it toward white.
 * amount: 0–1 (default 0.15 = 15% toward white)
 */
export function lightenHex(hex: string, amount = 0.15): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const clamp = (v: number) => Math.min(255, Math.round(v + (255 - v) * amount));
  return (
    "#" +
    clamp(r).toString(16).padStart(2, "0") +
    clamp(g).toString(16).padStart(2, "0") +
    clamp(b).toString(16).padStart(2, "0")
  );
}

/**
 * Returns the R, G, B channels of a hex colour as a numeric triplet.
 */
export function hexToRgbTriplet(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}
