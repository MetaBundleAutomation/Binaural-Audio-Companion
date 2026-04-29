"use client";

import React from "react";
import { tracks, hexToRgbTriplet } from "@/data/tracks";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { usePreferences } from "@/hooks/usePreferences";
import AudioCarousel from "./AudioCarousel";
import BoxBreathing from "./BoxBreathing";
import NoiseGenerator from "./NoiseGenerator";
import VolumeWarningModal from "./VolumeWarningModal";

function fireToast(msg: string) {
  window.dispatchEvent(new CustomEvent("crux:toast", { detail: msg }));
}

function hexToRgbVars(hex: string): React.CSSProperties {
  const [r, g, b] = hexToRgbTriplet(hex);
  return { "--beat-r": r, "--beat-g": g, "--beat-b": b } as React.CSSProperties;
}

export default function Player() {
  const engine         = useAudioEngine();
  const track          = tracks[engine.currentTrackIndex];
  const { prefs, set } = usePreferences();

  function handleSetDefault() {
    const alreadyDefault =
      prefs.defaultBeatId    === track.name &&
      prefs.defaultVolume    === engine.volume &&
      prefs.defaultLoopState === engine.isLooping;
    if (alreadyDefault) { fireToast("Already your default."); return; }
    set("defaultBeatId",    track.name);
    set("defaultVolume",    engine.volume);
    set("defaultLoopState", engine.isLooping);
    fireToast("Saved as your default.");
  }

  return (
    <>
      <VolumeWarningModal />

      {/* ── Player ──────────────────────────────────────────────────────────── */}
      <section id="player" className="my-16">
        <div
          className="rounded-3xl p-8 border border-[var(--border-color)] player-bg"
          style={{ boxShadow: "var(--shadow-lg)", ...hexToRgbVars(track.color) }}
        >

          {/* Track selector — swipeable carousel replaces the static hero card.
              Swiping / tapping a side card centres it and immediately loads that
              track into the engine. The Play button below starts playback. */}
          <AudioCarousel
            embedded
            currentIndex={engine.currentTrackIndex}
            isPlaying={engine.isPlaying}
            onSelect={(idx) => engine.loadTrack(idx)}
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

            {/* Secondary controls — loop & default */}
            <div className="flex justify-center items-center gap-6">

              {/* Loop toggle */}
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={engine.toggleLoop}
                  className="w-[38px] h-[38px] rounded-full flex items-center justify-center transition-all cursor-pointer"
                  style={
                    engine.isLooping
                      ? { background: "var(--primary)", boxShadow: "0 4px 12px rgba(43, 107, 127, 0.35)", color: "white" }
                      : { background: "var(--background-light)", color: "var(--text-secondary)" }
                  }
                  aria-label={engine.isLooping ? "Loop is on — tap to stop looping" : "Toggle loop — play continuously"}
                  aria-pressed={engine.isLooping}
                >
                  <svg
                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className="w-4 h-4"
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

              {/* Save as default */}
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={handleSetDefault}
                  aria-label="Set current beat and settings as my default"
                  className="w-[38px] h-[38px] rounded-full flex items-center justify-center transition-all cursor-pointer bg-[var(--background-light)]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <svg
                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className="w-4 h-4"
                  >
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                </button>
                <span className="text-[10px] font-semibold text-[var(--text-secondary)]">Default</span>
              </div>

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
