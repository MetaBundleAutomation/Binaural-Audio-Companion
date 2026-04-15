"use client";

import React, { useState } from "react";
import { tracks, parseDuration, formatTime } from "@/data/tracks"; // tracks used for currentTrackIndex lookup
import { useAudioEngine } from "@/hooks/useAudioEngine";
import Visualizer from "./Visualizer";
import Icon from "./Icons";
import BoxBreathing from "./BoxBreathing";
import NoiseGenerator from "./NoiseGenerator";
import AudioCarousel from "./AudioCarousel";

export default function Player() {
  const engine = useAudioEngine();
  // dragValue tracks slider position while user is scrubbing (keeps input always controlled)
  const [dragValue, setDragValue] = useState<number | null>(null);
  const track = tracks[engine.currentTrackIndex];
  const totalSeconds = parseDuration(track.duration);
  const displayElapsed = dragValue !== null ? dragValue : engine.elapsed;
  const remaining = totalSeconds - displayElapsed;
  const progressPct = totalSeconds > 0 ? (displayElapsed / totalSeconds) * 100 : 0;

  return (
    <>
      {/* Player Section */}
      <section id="player" className="my-16">
        <div
          className="rounded-3xl p-10 border border-[var(--border-color)] bg-[var(--background-card)]"
          style={{ boxShadow: "var(--shadow-lg)" }}
        >
          {/* Visualizer */}
          <div className="mb-8">
            <div className="visualizer-bg rounded-2xl h-[200px] flex items-center justify-center overflow-hidden relative border-2 border-[var(--border-color)]">
              <Visualizer analyser={engine.analyser} isPlaying={engine.isPlaying} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[2] text-white/30 drop-shadow-lg">
                <Icon name={track.icon} size={70} />
              </div>
            </div>
          </div>

          {/* Track Info */}
          <div className="text-center mb-8">
            <h3 className="text-[32px] font-bold mb-3 tracking-tight text-[var(--text-primary)]">
              {track.name}
            </h3>
            <p className="text-[17px] font-medium leading-relaxed text-[var(--text-secondary)]">
              {track.description}
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-5">
            {/* Progress */}
            <div className="flex items-center gap-4 bg-[var(--background-light)] rounded-xl px-5 py-3 border border-[var(--border-color)]">
              <span className="text-[15px] font-semibold text-[var(--text-secondary)] min-w-[50px] tabular-nums">
                {formatTime(displayElapsed)}
              </span>
              <input
                type="range"
                min={0}
                max={totalSeconds}
                value={displayElapsed}
                className="flex-1"
                style={{ '--fill': `${progressPct}%` } as React.CSSProperties}
                onMouseDown={(e) => setDragValue(Number((e.target as HTMLInputElement).value))}
                onMouseUp={(e) => {
                  const v = Number((e.target as HTMLInputElement).value);
                  engine.seek(v);
                  setDragValue(null);
                }}
                onTouchStart={(e) => setDragValue(Number((e.target as HTMLInputElement).value))}
                onTouchEnd={(e) => {
                  const v = Number((e.target as HTMLInputElement).value);
                  engine.seek(v);
                  setDragValue(null);
                }}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (dragValue !== null) setDragValue(v);
                }}
                aria-label="Track progress"
              />
              <span className="text-[15px] font-semibold text-[var(--text-secondary)] min-w-[50px] tabular-nums text-right">
                -{formatTime(remaining)}
              </span>
            </div>

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
                className="w-[70px] h-[70px] rounded-full flex items-center justify-center cursor-pointer transition-all"
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
                style={{ '--fill': `${engine.volume}%` } as React.CSSProperties}
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
