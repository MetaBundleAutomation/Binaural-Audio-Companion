"use client";

import React from "react";
import { tracks, parseDuration, formatTime } from "@/data/tracks";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import Icon from "./Icons";
import BoxBreathing from "./BoxBreathing";
import NoiseGenerator from "./NoiseGenerator";
import AudioCarousel from "./AudioCarousel";

// Matches the gradient cycle used in AudioCarousel
const GRADIENTS = [
  "from-[#2B6B7F] to-[#3A8FA3]",
  "from-[#4A5568] to-[#5A6B7A]",
  "from-[#1E4F5E] to-[#2B6B7F]",
  "from-[#8C9BAA] to-[#A0B0C0]",
];

export default function Player() {
  const engine  = useAudioEngine();
  const track   = tracks[engine.currentTrackIndex];
  const gradient = GRADIENTS[engine.currentTrackIndex % GRADIENTS.length];

  return (
    <>
      {/* Player Section */}
      <section id="player" className="my-16">
        <div
          className="rounded-3xl p-10 border border-[var(--border-color)] bg-[var(--background-card)]"
          style={{ boxShadow: "var(--shadow-lg)" }}
        >
          {/* ── Hero card display ──────────────────────────────────────────── */}
          <div className="mb-8">
            <div
              className={`w-full rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center gap-8 relative overflow-hidden`}
              style={{
                height: 220,
                border: "2px solid rgba(255,255,255,0.14)",
                boxShadow: "0 16px 48px rgba(0,0,0,0.35)",
              }}
            >
              {/* Glare highlight */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at 32% 18%, rgba(255,255,255,0.20) 0%, transparent 65%)",
                }}
              />

              {/* Equalizer bars — visible while playing */}
              {engine.isPlaying && (
                <div className="absolute top-4 right-4 flex items-end gap-[3px]">
                  {[12, 18, 10, 16, 8].map((h, i) => (
                    <div
                      key={i}
                      className="w-[3px] rounded-full bg-white/75"
                      style={{
                        height: h,
                        transformOrigin: "bottom",
                        animation: `eq-bar 0.7s ease-in-out ${i * 0.13}s infinite alternate`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Icon */}
              <div className="text-white/90 z-10 shrink-0">
                <Icon name={track.icon} size={80} />
              </div>

              {/* Track info */}
              <div className="z-10 flex flex-col gap-2 max-w-xs">
                <p className="text-white font-bold text-[26px] leading-tight tracking-tight">
                  {track.name}
                </p>
                <p className="text-white/60 text-[13px] font-semibold tabular-nums">
                  {formatTime(parseDuration(track.duration))}
                  {track.fadeOutDuration ? " · fades gently" : ""}
                </p>
                <p className="text-white/55 text-[13px] leading-relaxed line-clamp-2">
                  {track.description.split("—")[0].split("·")[0].trim()}
                </p>
              </div>
            </div>
          </div>

          {/* ── Controls ──────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-5">

            {/* Play Controls */}
            <div className="flex justify-center items-center gap-5">
              <button
                onClick={engine.prevTrack}
                className="w-[50px] h-[50px] rounded-full flex items-center justify-center bg-[var(--background-light)] hover:bg-[var(--primary-dark)] transition-all cursor-pointer"
                aria-label="Previous track"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>

              <button
                onClick={engine.togglePlay}
                className="w-[70px] h-[70px] rounded-full flex items-center justify-center cursor-pointer transition-all text-white"
                style={{
                  background: "var(--primary)",
                  boxShadow: "0 8px 24px rgba(43, 107, 127, 0.4)",
                }}
                aria-label={engine.isPlaying ? "Pause" : "Play"}
              >
                {engine.isPlaying ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                    <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <button
                onClick={engine.nextTrack}
                className="w-[50px] h-[50px] rounded-full flex items-center justify-center bg-[var(--background-light)] hover:bg-[var(--primary-dark)] transition-all cursor-pointer"
                aria-label="Next track"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-4 bg-[var(--background-light)] rounded-xl px-5 py-3 border border-[var(--border-color)]">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 shrink-0 text-[var(--text-secondary)]">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
              </svg>
              <input
                type="range"
                min={0}
                max={100}
                value={engine.volume}
                onChange={(e) => engine.setVolume(Number(e.target.value))}
                className="flex-1"
                style={{ "--fill": `${engine.volume}%` } as React.CSSProperties}
                aria-label="Volume control"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Noise Therapy */}
      <NoiseGenerator isAudioPlaying={engine.isPlaying} />

      {/* Box Breathing */}
      <BoxBreathing isAudioPlaying={engine.isPlaying} />

      {/* Track Library — Coverflow carousel */}
      <AudioCarousel
        currentIndex={engine.currentTrackIndex}
        isPlaying={engine.isPlaying}
        onSelect={(idx) => {
          engine.loadTrack(idx);
          document.getElementById("player")?.scrollIntoView({ behavior: "smooth" });
        }}
      />
    </>
  );
}
