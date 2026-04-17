"use client";

import React, { useRef, useState, useEffect } from "react";
import { tracks, parseDuration, formatTime } from "@/data/tracks";
import Icon from "./Icons";

// ─── Layout constants ─────────────────────────────────────────────────────────

const CARD_W    = 280;   // hero card width  (px)
const CARD_H    = 340;   // hero card height (px)
const STEP_1    = 170;   // center-to-center: hero  → peek  (px)
const STEP_2    = 175;   // additional step:  peek  → far   (px)

const PEEK_SCALE   = 0.68;
const FAR_SCALE    = 0.50;
const PEEK_OPACITY = 0.65;
const FAR_OPACITY  = 0.28;

const GRADIENTS = [
  "from-[#2B6B7F] to-[#3A8FA3]",
  "from-[#4A5568] to-[#5A6B7A]",
  "from-[#1E4F5E] to-[#2B6B7F]",
  "from-[#8C9BAA] to-[#A0B0C0]",
];

// Drag-vs-tap: ignore clicks where the pointer moved more than this
const TAP_MAX_MOVE_PX = 8;

// ─── Props ────────────────────────────────────────────────────────────────────

interface AudioCarouselProps {
  currentIndex: number;
  isPlaying: boolean;
  onSelect: (index: number) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getOffset(idx: number, centreIndex: number): number {
  let offset = (idx - centreIndex + tracks.length) % tracks.length;
  if (offset > tracks.length / 2) offset -= tracks.length;
  return offset;
}

function cardStyles(offset: number): React.CSSProperties {
  const abs = Math.abs(offset);

  let xShift = 0;
  if (abs === 1) xShift = Math.sign(offset) * STEP_1;
  else if (abs === 2) xShift = Math.sign(offset) * (STEP_1 + STEP_2);
  else if (abs >= 3) xShift = Math.sign(offset) * 900; // fully off-screen

  const scale   = abs === 0 ? 1 : abs === 1 ? PEEK_SCALE : abs === 2 ? FAR_SCALE : 0.3;
  const opacity = abs === 0 ? 1 : abs === 1 ? PEEK_OPACITY : abs === 2 ? FAR_OPACITY : 0;

  return {
    position:      "absolute",
    top:           "50%",
    left:          "50%",
    width:         CARD_W,
    height:        CARD_H,
    marginLeft:    -CARD_W / 2,
    marginTop:     -CARD_H / 2,
    transform:     `translateX(${xShift}px) scale(${scale})`,
    opacity,
    zIndex:        10 - abs * 3,
    visibility:    abs <= 2 ? "visible" : "hidden",
    // Hero (abs=0) and immediate peek (abs=1) are interactive; beyond that → none
    pointerEvents: abs <= 1 ? "auto" : "none",
    cursor:        abs <= 1 ? "pointer" : "default",
    transition:    "transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.45s ease",
    willChange:    "transform, opacity",
  } as React.CSSProperties;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AudioCarousel({ currentIndex, isPlaying, onSelect }: AudioCarouselProps) {
  // browseIndex: which card is visually centred. Decoupled from the playing track.
  const [browseIndex, setBrowseIndex] = useState(currentIndex);

  // Sync browse position whenever the audio engine advances to a new track
  // (auto-advance, or prev/next buttons in the player).
  useEffect(() => {
    setBrowseIndex(currentIndex);
  }, [currentIndex]);

  const touchStartX  = useRef(0);
  const touchStartY  = useRef(0);
  const pointerDownX = useRef(0);
  const pointerDownY = useRef(0);

  // Scroll carousel left/right — browse only, never triggers playback
  function go(delta: number) {
    setBrowseIndex((prev) => (prev + delta + tracks.length) % tracks.length);
  }

  // Touch swipe handlers on the container
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    const dy = touchStartY.current - e.changedTouches[0].clientY;
    // Only trigger if horizontal movement dominates (not a page scroll)
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      go(dx > 0 ? 1 : -1);
    }
  }

  // Returns true if the pointer barely moved (a genuine tap, not a drag)
  function isATap(e: React.MouseEvent): boolean {
    return (
      Math.abs(e.clientX - pointerDownX.current) <= TAP_MAX_MOVE_PX &&
      Math.abs(e.clientY - pointerDownY.current) <= TAP_MAX_MOVE_PX
    );
  }

  return (
    <section id="library" className="my-20">
      <h2 className="text-[40px] font-bold mb-10 text-center tracking-tight text-[var(--text-primary)]">
        Audio Library
      </h2>

      {/* ── Carousel track ─────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{ height: CARD_H + 60 }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {tracks.map((track, idx) => {
          const offset   = getOffset(idx, browseIndex);
          const isHero   = offset === 0;
          const isActive = idx === currentIndex; // currently loaded/playing track
          const gradient = GRADIENTS[idx % GRADIENTS.length];

          return (
            <div
              key={idx}
              style={cardStyles(offset)}
              onPointerDown={(e) => {
                pointerDownX.current = e.clientX;
                pointerDownY.current = e.clientY;
              }}
              onClick={(e) => {
                if (!isATap(e)) return; // drag — ignore
                if (isHero) {
                  // Second tap: hero card → load track + scroll to player
                  onSelect(idx);
                } else {
                  // First tap: non-hero → centre it, no playback
                  setBrowseIndex(idx);
                }
              }}
              aria-label={isHero ? `Play ${track.name}` : `Browse to ${track.name}`}
            >
              {/* Card face */}
              <div
                className={`w-full h-full rounded-3xl bg-gradient-to-br ${gradient} flex flex-col items-center justify-center gap-3 relative overflow-hidden`}
                style={{
                  border: isHero ? "2px solid rgba(255,255,255,0.18)" : "2px solid transparent",
                  boxShadow: isHero
                    ? "0 24px 64px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06)"
                    : "none",
                }}
              >
                {/* Glare highlight */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse at 35% 18%, rgba(255,255,255,0.22) 0%, transparent 65%)",
                  }}
                />

                {/* Equalizer bars — hero card AND currently playing track */}
                {isHero && isActive && isPlaying && (
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

                {/* PLAY badge — hero card when not currently playing */}
                {isHero && !(isActive && isPlaying) && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-1 z-10 pointer-events-none">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-white">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <span className="text-white text-[10px] font-bold tracking-wide">PLAY</span>
                  </div>
                )}

                {/* Icon */}
                <div className="text-white/90 z-10">
                  <Icon name={track.icon} size={isHero ? 68 : 52} />
                </div>

                {/* Track name */}
                <div className="text-center z-10 px-5">
                  <p
                    className="text-white font-bold leading-tight tracking-tight"
                    style={{ fontSize: isHero ? 22 : 17 }}
                  >
                    {track.name}
                  </p>

                  {/* Hero: duration + fade hint */}
                  {isHero && (
                    <p className="text-white/60 text-[12px] mt-1 font-medium tabular-nums">
                      {formatTime(parseDuration(track.duration))}
                      {track.fadeOutDuration ? " · fades" : ""}
                    </p>
                  )}
                </div>

                {/* Hero: short description */}
                {isHero && (
                  <p className="text-white/55 text-[12px] leading-relaxed text-center px-6 z-10 line-clamp-2">
                    {track.description.split("—")[0].split("·")[0].trim()}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {/* Prev / Next arrows — browse only */}
        <button
          onClick={() => go(-1)}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center bg-[var(--background-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--primary)] transition-all cursor-pointer"
          aria-label="Browse to previous track"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>

        <button
          onClick={() => go(1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center bg-[var(--background-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--primary)] transition-all cursor-pointer"
          aria-label="Browse to next track"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
          </svg>
        </button>
      </div>

      {/* ── Dot indicators — browse only ───────────────────────────────────── */}
      <div className="flex justify-center gap-2 mt-5">
        {tracks.map((_, i) => (
          <button
            key={i}
            onClick={() => setBrowseIndex(i)}
            className="rounded-full transition-all duration-300 cursor-pointer"
            style={{
              width:      i === browseIndex ? 20 : 8,
              height:     8,
              background: i === browseIndex ? "var(--primary)" : "var(--border-color)",
            }}
            aria-label={`Browse to track ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
