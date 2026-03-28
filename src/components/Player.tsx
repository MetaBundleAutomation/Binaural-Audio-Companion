"use client";

import { useRef } from "react";
import { tracks, parseDuration, formatTime } from "@/data/tracks";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import Visualizer from "./Visualizer";
import TrackCard from "./TrackCard";
import Icon from "./Icons";

export default function Player() {
  const engine = useAudioEngine();
  const seekingRef = useRef(false);
  const track = tracks[engine.currentTrackIndex];
  const totalSeconds = parseDuration(track.duration);
  const remaining = totalSeconds - engine.elapsed;

  return (
    <>
      {/* Player Section */}
      <section className="my-16">
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
            <div className="flex items-center gap-4">
              <span className="text-[15px] font-semibold text-[var(--text-secondary)] min-w-[50px] tabular-nums">
                {formatTime(engine.elapsed)}
              </span>
              <input
                type="range"
                min={0}
                max={totalSeconds}
                value={seekingRef.current ? undefined : engine.elapsed}
                defaultValue={0}
                className="flex-1 h-1.5"
                onMouseDown={() => { seekingRef.current = true; }}
                onMouseUp={(e) => {
                  seekingRef.current = false;
                  engine.seek(Number((e.target as HTMLInputElement).value));
                }}
                onTouchStart={() => { seekingRef.current = true; }}
                onTouchEnd={(e) => {
                  seekingRef.current = false;
                  engine.seek(Number((e.target as HTMLInputElement).value));
                }}
                onChange={(e) => {
                  if (!seekingRef.current) {
                    engine.seek(Number(e.target.value));
                  }
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
                  background: "var(--gradient-1)",
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
            <div className="flex items-center justify-center gap-4">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[var(--text-secondary)]">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
              </svg>
              <input
                type="range"
                min={0}
                max={100}
                value={engine.volume}
                onChange={(e) => engine.setVolume(Number(e.target.value))}
                className="w-[120px] h-1.5"
                aria-label="Volume control"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Track Library */}
      <section id="library" className="my-20">
        <h2 className="text-[40px] font-bold mb-10 text-center tracking-tight text-[var(--text-primary)]">
          Audio Library
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tracks.map((t, i) => (
            <TrackCard
              key={t.name}
              track={t}
              index={i}
              isActive={i === engine.currentTrackIndex}
              onClick={() => engine.loadTrack(i)}
            />
          ))}
        </div>
      </section>
    </>
  );
}
