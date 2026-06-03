"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { tracks, hexToRgbTriplet, parseDuration, formatTime } from "@/data/tracks";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { usePreferences } from "@/hooks/usePreferences";
import AudioCarousel from "./AudioCarousel";
import AromatherapyCard from "./AromatherapyCard";
import BoxBreathing from "./BoxBreathing";
import NoiseGenerator from "./NoiseGenerator";
import VolumeWarningModal from "./VolumeWarningModal";

function hexToRgbVars(hex: string): React.CSSProperties {
  const [r, g, b] = hexToRgbTriplet(hex);
  return { "--beat-r": r, "--beat-g": g, "--beat-b": b } as React.CSSProperties;
}

export default function Player() {
  const engine         = useAudioEngine();
  const track          = tracks[engine.currentTrackIndex];
  const { prefs } = usePreferences();

  // Session progress for the player's time/progress display
  const totalSeconds = parseDuration(track.duration);
  const progressPct  = totalSeconds ? Math.min(100, (engine.elapsed / totalSeconds) * 100) : 0;

  // Track which card is centred in the carousel so AromatherapyCard updates live
  const [browseTrackName, setBrowseTrackName] = useState(
    tracks[engine.currentTrackIndex]?.name ?? tracks[0].name
  );
  useEffect(() => {
    setBrowseTrackName(tracks[engine.currentTrackIndex]?.name ?? tracks[0].name);
  }, [engine.currentTrackIndex]);

  return (
    <>
      <VolumeWarningModal />

      {/* ── Aromatherapy pairing card ────────────────────────────────────────── */}
      {prefs.showAromatherapy && (
        <AromatherapyCard trackName={browseTrackName} />
      )}

      {/* ── Player ──────────────────────────────────────────────────────────── */}
      <section id="player" className="my-16 scroll-mt-24">
        <div
          className="rounded-3xl p-8 border border-[var(--border-color)] player-bg"
          style={{ boxShadow: "var(--shadow-lg)", ...hexToRgbVars(track.color) }}
        >

          {/* Section title */}
          <h2 className="text-[32px] font-bold mb-4 tracking-tight text-[var(--text-primary)] text-center">
            Binaural Beats
          </h2>

          {/* Link to the session guide in Instructions */}
          <div className="flex justify-center mb-6">
            <Link
              href="/instructions#choosing-a-binaural-beat"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold text-[var(--primary)] bg-[var(--background-light)] border border-[var(--border-color)] hover:border-[var(--primary)] transition-all"
            >
              <svg
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="w-4 h-4"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              Tap to learn how to choose a Binaural Beat
            </Link>
          </div>

          {/* Track selector — swipeable carousel replaces the static hero card.
              Swiping / tapping a side card centres it and immediately loads that
              track into the engine. The Play button below starts playback. */}
          <AudioCarousel
            embedded
            currentIndex={engine.currentTrackIndex}
            isPlaying={engine.isPlaying}
            onSelect={(idx) => engine.loadTrack(idx)}
            onBrowse={setBrowseTrackName}
          />

          {/* Controls */}
          <div className="flex flex-col gap-5 mt-5">

            {/* Volume reminder */}
            <p className="text-center text-xs text-[var(--text-secondary)]">
              🎧 Lower your volume before pressing play
            </p>

            {/* Play / Pause — centred, prominent */}
            <div className="flex justify-center">
              <button
                onClick={engine.togglePlay}
                className="w-[70px] h-[70px] rounded-full flex items-center justify-center cursor-pointer transition-all text-white"
                style={{
                  background: "var(--primary)",
                  boxShadow:  "0 8px 24px rgba(43, 107, 127, 0.4)",
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
            </div>

            {/* Session progress — elapsed · bar · total */}
            <div className="flex items-center gap-3 px-1 text-[11px] tabular-nums text-[var(--text-secondary)]">
              <span>{formatTime(Math.min(engine.elapsed, totalSeconds))}</span>
              <div className="flex-1 h-1 rounded-full bg-[var(--background-light)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--primary)]"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span>{formatTime(totalSeconds)}</span>
            </div>

            {/* Volume slider */}
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
      <BoxBreathing />
    </>
  );
}
