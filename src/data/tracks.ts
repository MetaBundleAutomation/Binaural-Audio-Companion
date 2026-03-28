export interface Track {
  name: string;
  description: string;
  duration: string;
  binauralFreq: number;
  icon: string;
}

export const tracks: Track[] = [
  {
    name: "Focus",
    description: "30 Minutes of 25 Hz Beta waves for deep concentration",
    duration: "30:00",
    binauralFreq: 25,
    icon: "focus",
  },
  {
    name: "Calm",
    description: "25 Minutes of 12 Hz Alpha waves for relaxing the mind",
    duration: "25:00",
    binauralFreq: 12,
    icon: "calm",
  },
  {
    name: "Sleep",
    description: "45 Minutes of 4 Hz Delta waves for deep sleep",
    duration: "45:00",
    binauralFreq: 4,
    icon: "sleep",
  },
  {
    name: "Creativity",
    description: "35 Minutes of 8 Hz Alpha waves for exploring creativity",
    duration: "35:00",
    binauralFreq: 8,
    icon: "creativity",
  },
  {
    name: "Energy",
    description: "20 Minutes of 30 Hz Beta waves for exercise and mental alertness",
    duration: "20:00",
    binauralFreq: 30,
    icon: "energy",
  },
  {
    name: "Meditation",
    description: "40 Minutes of 6 Hz Theta waves for staying in the present with daily mindfulness",
    duration: "40:00",
    binauralFreq: 6,
    icon: "meditation",
  },
  {
    name: "Learning",
    description: "50 Minutes of 10 Hz Alpha waves for attention and memory",
    duration: "50:00",
    binauralFreq: 10,
    icon: "learning",
  },
  {
    name: "Anxiety",
    description: "30 Minutes of 8 Hz Alpha waves for calming the mind and relieving stress",
    duration: "30:00",
    binauralFreq: 8,
    icon: "anxiety",
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
