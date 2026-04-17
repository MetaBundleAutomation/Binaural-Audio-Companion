"use client";

import React from "react";
import { tracks, parseDuration, formatTime, lightenHex, hexToRgbTriplet } from "@/data/tracks";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import Icon from "./Icons";
import BoxBreathing from "./BoxBreathing";
import NoiseGenerator from "./NoiseGenerator";
import AudioCarousel from "./AudioCarousel";
import VolumeWarningModal from "./VolumeWarningModal";

function hexToRgbVars(hex: string): React.CSSProperties {
  const [r, g, b] = hexToRgbTriplet(hex);
  return { "--beat-r": r, "--beat-g": g, "--beat-b": b } as React.CSSProperties;
}

export default function Player() {
  const engine = useAudioEngine();
  const track  = tracks[engine.currentTrackIndex];

  return (
    <>
      <VolumeWarningModal />

      {/* Player Section */}
      <section id="player" className="my-16">
        <div
          className="rounded-3xl p-10 border border-[var(--border-color)] player-bg"
          style={{ boxShadow: "var(--shadow-lg)", ...hexToRgbVars(track.color) }}
        >
          {/* ── Hero card display ──────────────────────────────────────────── */}
          <div className="mb-8">
            <div
              className="w-full rounded-2xl flex items-center justify-center gap-8 relative overflow-hidden"
              style={{
                height: 220,
                background: `linear-gradient(135deg, ${track.color} 0%, ${lightenHex(track.color)} 100%)`,
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

            {/* Volume reminder */}
            <p className="text-center text-xs text-[var(--text-secondary)]">
              🎧 Lower your volume before pressing play
            </p>

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

              {/* Loop toggle with label */}
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={engine.toggleLoop}
                  className="w-[50px] h-[50px] rounded-full flex items-center justify-center transition-all cursor-pointer"
                  style={
                    engine.isLooping
                      ? {
                          background: "var(--primary)",
                          boxShadow: "0 4px 12px rgba(43, 107, 127, 0.35)",
                          color: "white",
                        }
                      : {
                          background: "var(--background-light)",
                          color: "var(--text-secondary)",
                        }
                  }
                  aria-label={
                    engine.isLooping
                      ? "Loop is on — tap to stop looping"
                      : "Toggle loop — play continuously"
                  }
                  aria-pressed={engine.isLooping}
                >
                  {/* Repeat icon */}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5"
                  >
                    <polyline points="17 1 21 5 17 9" />
                    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                    <polyline points="7 23 3 19 7 15" />
                    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                  </svg>
                </button>
                <span className="text-[10px] font-semibold text-[var(--text-secondary)]">
                  {engine.isLooping ? "Loop: On" : "Loop"}
                </span>
              </div>
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
