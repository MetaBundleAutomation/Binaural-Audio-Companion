"use client";

import { Track } from "@/data/tracks";
import Icon from "./Icons";

interface TrackCardProps {
  track: Track;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

const gradients = [
  "bg-gradient-to-br from-[#2B6B7F] to-[#3A8FA3]",
  "bg-gradient-to-br from-[#4A5568] to-[#5A6B7A]",
  "bg-gradient-to-br from-[#1E4F5E] to-[#2B6B7F]",
  "bg-gradient-to-br from-[#8C9BAA] to-[#A0B0C0]",
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
        className={`w-[60px] h-[60px] rounded-xl flex items-center justify-center mb-4 text-white ${
          gradients[index % gradients.length]
        }`}
      >
        <Icon name={track.icon} size={28} />
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
