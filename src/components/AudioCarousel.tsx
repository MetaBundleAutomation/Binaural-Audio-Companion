"use client";

import React, { useRef } from "react";
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

// ─── Props ────────────────────────────────────────────────────────────────────

interface AudioCarouselProps {
  currentIndex: number;
  isPlaying: boolean;
  onSelect: (index: number) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getOffset(idx: number, currentIndex: number): number {
  let offset = (idx - currentIndex + tracks.length) % tracks.length;
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
    position:   "absolute",
    top:        "50%",
    left:       "50%",
    width:      CARD_W,
    height:     CARD_H,
    marginLeft: -CARD_W / 2,
    marginTop:  -CARD_H / 2,
    transform:  `translateX(${xShift}px) scale(${scale})`,
    opacity,
    zIndex:     10 - abs * 3,
    visibility: abs <= 2 ? "visible" : "hidden",
    pointerEvents: abs <= 1 && abs !== 0 ? "auto" : abs === 0 ? "none" : "none",
    cursor:     abs > 0 && abs <= 1 ? "pointer" : "default",
    transition: "transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.45s ease",
    willChange: "transform, opacity",
  } as React.CSSProperties;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AudioCarousel({ currentIndex, isPlaying, onSelect }: AudioCarouselProps) {
  const touchStartX = useRef(0);

  function go(delta: number) {
    const next = (currentIndex + delta + tracks.length) % tracks.length;
    onSelect(next);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) go(dx > 0 ? 1 : -1);
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
          const offset   = getOffset(idx, currentIndex);
          const isHero   = offset === 0;
          const gradient = GRADIENTS[idx % GRADIENTS.length];

          return (
            <div
              key={idx}
              style={cardStyles(offset)}
              onClick={() => !isHero && onSelect(idx)}
              aria-label={isHero ? undefined : `Select ${track.name}`}
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

                {/* Live equalizer bars — hero + playing only */}
                {isHero && isPlaying && (
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
                <div className="text-white/90 z-10">
                  <Icon name={track.icon} size={isHero ? 68 : 52} />
                </div>

                {/* Track name */}
                <div className="text-center z-10 px-5">
                  <p className="text-white font-bold leading-tight tracking-tight"
                    style={{ fontSize: isHero ? 22 : 17 }}>
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

        {/* Prev / Next arrows */}
        <button
          onClick={() => go(-1)}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center bg-[var(--background-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--primary)] transition-all cursor-pointer"
          aria-label="Previous track"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>

        <button
          onClick={() => go(1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center bg-[var(--background-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--primary)] transition-all cursor-pointer"
          aria-label="Next track"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
          </svg>
        </button>
      </div>

      {/* ── Dot indicators ─────────────────────────────────────────────────── */}
      <div className="flex justify-center gap-2 mt-5">
        {tracks.map((_, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className="rounded-full transition-all duration-300 cursor-pointer"
            style={{
              width:      i === currentIndex ? 20 : 8,
              height:     8,
              background: i === currentIndex ? "var(--primary)" : "var(--border-color)",
            }}
            aria-label={`Select track ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
