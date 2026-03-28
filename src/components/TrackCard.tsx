"use client";

import { Track } from "@/data/tracks";

interface TrackCardProps {
  track: Track;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

const gradients = [
  "bg-gradient-to-br from-[#A8B400] to-[#C4D100]",
  "bg-gradient-to-br from-[#D6C18A] to-[#E8DCC8]",
  "bg-gradient-to-br from-[#F7F5E6] to-[#A8B400]",
  "bg-gradient-to-br from-[#fa709a] to-[#fee140]",
];

export default function TrackCard({ track, index, isActive, onClick }: TrackCardProps) {
  return (
    <button
      onClick={onClick}
      className={`text-left rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 cursor-pointer ${
        isActive
          ? "border-[var(--primary)] bg-[var(--background-light)]"
          : "border-[var(--border-color)] bg-[var(--background-card)] hover:border-[var(--primary)]"
      }`}
      style={{ boxShadow: isActive ? "var(--shadow)" : undefined }}
    >
      <div
        className={`w-[60px] h-[60px] rounded-xl flex items-center justify-center text-[34px] mb-4 ${
          gradients[index % gradients.length]
        }`}
      >
        {track.icon}
      </div>
      <h3 className="text-[21px] font-bold mb-2 tracking-tight text-[var(--text-primary)]">
        {track.name}
      </h3>
      <p className="text-[15px] font-medium leading-relaxed text-[var(--text-secondary)]">
        {track.description}
      </p>
    </button>
  );
}
