export interface Track {
  name: string;
  description: string;
  duration: string;
  binauralFreq: number;
  icon: string;
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
    fadeOutDuration: 300,
  },
  {
    name: "Calm",
    description:
      "15 Minutes of 12 Hz Alpha waves for relaxing the mind — fades gently over the final 5 minutes",
    duration: "15:00",
    binauralFreq: 12,
    icon: "calm",
    fadeOutDuration: 300,
  },
  {
    name: "Sleep",
    description:
      "15 Minutes of 4 Hz Delta waves for deep sleep — fades gently over the final 5 minutes",
    duration: "15:00",
    binauralFreq: 4,
    icon: "sleep",
    fadeOutDuration: 300,
  },
  {
    name: "Creativity",
    description:
      "15 Minutes of 8 Hz Alpha waves for exploring creativity — fades gently over the final 5 minutes",
    duration: "15:00",
    binauralFreq: 8,
    icon: "creativity",
    fadeOutDuration: 300,
  },
  {
    name: "Energy",
    description:
      "15 Minutes of 30 Hz Beta waves for exercise and mental alertness — fades gently over the final 5 minutes",
    duration: "15:00",
    binauralFreq: 30,
    icon: "energy",
    fadeOutDuration: 300,
  },
  {
    name: "Meditation",
    description:
      "15 Minutes of 6 Hz Theta waves for staying in the present with daily mindfulness — fades gently over the final 5 minutes",
    duration: "15:00",
    binauralFreq: 6,
    icon: "meditation",
    fadeOutDuration: 300,
  },
  {
    name: "Learning",
    description:
      "15 Minutes of 10 Hz Alpha waves for attention and memory — fades gently over the final 5 minutes",
    duration: "15:00",
    binauralFreq: 10,
    icon: "learning",
    fadeOutDuration: 300,
  },
  {
    name: "Anxiety",
    description:
      "15 Minutes of 8 Hz Alpha waves for calming the mind and relieving stress — fades gently over the final 5 minutes",
    duration: "15:00",
    binauralFreq: 8,
    icon: "anxiety",
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
