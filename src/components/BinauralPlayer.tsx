"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { tracks, hexToRgbTriplet, parseDuration, formatTime } from "@/data/tracks";
import type { useAudioEngine } from "@/hooks/useAudioEngine";
import { usePreferences } from "@/hooks/usePreferences";
import AudioCarousel from "./AudioCarousel";
import AromatherapyCard from "./AromatherapyCard";
import VolumeWarningModal from "./VolumeWarningModal";

type Engine = ReturnType<typeof useAudioEngine>;

function hexToRgbVars(hex: string): React.CSSProperties {
  const [r, g, b] = hexToRgbTriplet(hex);
  return { "--beat-r": r, "--beat-g": g, "--beat-b": b } as React.CSSProperties;
}

/**
 * The Binaural Beats page body. The audio engine is owned by ToolStage (so it
 * survives navigation) and passed in here.
 */
export default function BinauralPlayer({ engine }: { engine: Engine }) {
  const track = tracks[engine.currentTrackIndex];
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
        <div id="aromatherapy-pairing" className="scroll-mt-24 pt-8">
          <AromatherapyCard trackName={browseTrackName} />
        </div>
      )}

      {/* ── Player ──────────────────────────────────────────────────────────── */}
      <section id="player" className="my-16 scroll-mt-24">
        <div
          className="card player-bg p-5 sm:p-8"
          style={{ boxShadow: "var(--shadow-lg)", ...hexToRgbVars(track.color) }}
        >
          <div className="flex flex-col items-center text-center mb-6">
            <span className="eyebrow">Binaural Beats</span>
            <h2 className="mt-4 text-[26px] md:text-[32px] font-semibold tracking-tight text-[var(--text-primary)]">
              Sessions for focus, calm and sleep
            </h2>
            <Link href="/instructions#choosing-a-binaural-beat" className="btn-ghost mt-4">
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

          {/* Track selector — swiping / tapping a side card centres it and loads
              that track into the engine. The Play button below starts playback. */}
          <AudioCarousel
            embedded
            currentIndex={engine.currentTrackIndex}
            isPlaying={engine.isPlaying}
            onSelect={(idx) => engine.loadTrack(idx)}
            onBrowse={setBrowseTrackName}
          />

          <div className="flex flex-col gap-5 mt-5">
            <p className="text-center text-[13px] text-[var(--text-secondary)]">
              🎧 Lower your volume before pressing play
            </p>

            <div className="flex justify-center">
              <button
                onClick={engine.togglePlay}
                className="w-[70px] h-[70px] rounded-full flex items-center justify-center cursor-pointer transition-all text-[var(--on-accent)] hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
                  boxShadow:  "0 12px 40px -12px var(--glow)",
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

            <div className="flex items-center gap-3 px-1 text-[11px] tabular-nums text-[var(--text-secondary)]">
              <span>{formatTime(Math.min(engine.elapsed, totalSeconds))}</span>
              <div className="flex-1 h-1 rounded-full bg-[var(--background-light)] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${progressPct}%`,
                    background: "linear-gradient(90deg, var(--accent), var(--accent-2))",
                  }}
                />
              </div>
              <span>{formatTime(totalSeconds)}</span>
            </div>

            <div className="flex items-center gap-4 glass rounded-2xl px-5 py-3">
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
    </>
  );
}
