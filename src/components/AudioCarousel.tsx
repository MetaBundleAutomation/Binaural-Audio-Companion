"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import { tracks, parseDuration, formatTime, lightenHex } from "@/data/tracks";
import Icon from "./Icons";
import { usePreferences } from "@/hooks/usePreferences";

// ─── Layout constants — standalone (full library section) ─────────────────────

const CARD_W   = 280;
const CARD_H   = 340;
const STEP_1   = 170;
const STEP_2   = 175;

// ─── Layout constants — embedded (inside the player card) ─────────────────────

const EMBED_CARD_W = 190;
const EMBED_CARD_H = 215;
const EMBED_STEP_1 = 122;
const EMBED_STEP_2 = 127;

// ─── Shared visual constants ──────────────────────────────────────────────────

const PEEK_SCALE   = 0.68;
const FAR_SCALE    = 0.50;
const PEEK_OPACITY = 0.65;
const FAR_OPACITY  = 0.28;

// Drag-vs-tap: ignore clicks where the pointer moved more than this
const TAP_MAX_MOVE_PX = 8;

// ─── Props ────────────────────────────────────────────────────────────────────

interface AudioCarouselProps {
  currentIndex: number;
  isPlaying:    boolean;
  onSelect:     (index: number) => void;
  /** When true, renders compactly inside the player card with auto-load on browse */
  embedded?:    boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getOffset(idx: number, centreIndex: number, count: number): number {
  let offset = (idx - centreIndex + count) % count;
  if (offset > count / 2) offset -= count;
  return offset;
}

function cardStyles(
  offset: number,
  cardW:  number,
  cardH:  number,
  step1:  number,
  step2:  number,
): React.CSSProperties {
  const abs = Math.abs(offset);

  let xShift = 0;
  if      (abs === 1) xShift = Math.sign(offset) * step1;
  else if (abs === 2) xShift = Math.sign(offset) * (step1 + step2);
  else if (abs >= 3)  xShift = Math.sign(offset) * 900;   // fully off-screen

  const scale   = abs === 0 ? 1 : abs === 1 ? PEEK_SCALE : abs === 2 ? FAR_SCALE : 0.3;
  const opacity = abs === 0 ? 1 : abs === 1 ? PEEK_OPACITY : abs === 2 ? FAR_OPACITY : 0;

  return {
    position:      "absolute",
    top:           "50%",
    left:          "50%",
    width:         cardW,
    height:        cardH,
    marginLeft:    -cardW / 2,
    marginTop:     -cardH / 2,
    transform:     `translateX(${xShift}px) scale(${scale})`,
    opacity,
    zIndex:        10 - abs * 3,
    visibility:    abs <= 2 ? "visible" : "hidden",
    pointerEvents: abs <= 1 ? "auto" : "none",
    cursor:        abs <= 1 ? "pointer" : "default",
    transition:    "transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.45s ease",
    willChange:    "transform, opacity",
  } as React.CSSProperties;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AudioCarousel({
  currentIndex,
  isPlaying,
  onSelect,
  embedded = false,
}: AudioCarouselProps) {
  const { prefs, toggleFavouriteBeat } = usePreferences();

  // Pick dimension set based on mode
  const cardW = embedded ? EMBED_CARD_W : CARD_W;
  const cardH = embedded ? EMBED_CARD_H : CARD_H;
  const step1 = embedded ? EMBED_STEP_1 : STEP_1;
  const step2 = embedded ? EMBED_STEP_2 : STEP_2;

  // Favourites-first display order — pure reordering, all tracks still present
  const displayTracks = useMemo(() => {
    const favSet = new Set(prefs.favouriteBeats);
    const favs = tracks.filter(t => favSet.has(t.name));
    const rest = tracks.filter(t => !favSet.has(t.name));
    return [...favs, ...rest];
  }, [prefs.favouriteBeats]);

  // Track the centred card by name so reordering doesn't cause a visual jump
  const browseTrackRef = useRef<string>(tracks[currentIndex]?.name ?? tracks[0].name);
  const [, forceUpdate] = useState(0);

  // browseIndex is derived so it stays correct whenever displayTracks reorders
  const browseIndex = Math.max(
    0,
    displayTracks.findIndex(t => t.name === browseTrackRef.current),
  );

  // Sync browse position when the audio engine advances to a new track
  useEffect(() => {
    browseTrackRef.current = tracks[currentIndex]?.name ?? tracks[0].name;
    forceUpdate(n => n + 1);
  }, [currentIndex]);

  const touchStartX  = useRef(0);
  const touchStartY  = useRef(0);
  const pointerDownX = useRef(0);
  const pointerDownY = useRef(0);

  // Scroll carousel left/right.
  // In embedded mode, browsing immediately loads the centred track.
  function go(delta: number) {
    const len      = displayTracks.length;
    const newIdx   = (browseIndex + delta + len) % len;
    const newTrack = displayTracks[newIdx];
    browseTrackRef.current = newTrack.name;
    forceUpdate(n => n + 1);
    if (embedded) onSelect(tracks.indexOf(newTrack));
  }

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

  function isATap(e: React.MouseEvent): boolean {
    return (
      Math.abs(e.clientX - pointerDownX.current) <= TAP_MAX_MOVE_PX &&
      Math.abs(e.clientY - pointerDownY.current) <= TAP_MAX_MOVE_PX
    );
  }

  // ── Carousel track ──────────────────────────────────────────────────────────

  const carouselTrack = (
    <div
      className="relative overflow-hidden"
      style={{ height: cardH + (embedded ? 48 : 60) }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {displayTracks.map((track, idx) => {
        const offset   = getOffset(idx, browseIndex, displayTracks.length);
        const isHero   = offset === 0;
        const isActive = track === tracks[currentIndex];
        const isFav    = prefs.favouriteBeats.includes(track.name);

        return (
          <div
            key={track.name}
            style={cardStyles(offset, cardW, cardH, step1, step2)}
            onPointerDown={(e) => {
              pointerDownX.current = e.clientX;
              pointerDownY.current = e.clientY;
            }}
            onClick={(e) => {
              if (!isATap(e)) return;
              if (embedded) {
                // Any tap: centre the card and immediately load it
                browseTrackRef.current = track.name;
                forceUpdate(n => n + 1);
                onSelect(tracks.indexOf(track));
              } else {
                if (isHero) {
                  // Tapping the hero card in standalone mode loads + plays
                  onSelect(tracks.indexOf(track));
                } else {
                  // Tapping a side card centres it (no load yet)
                  browseTrackRef.current = track.name;
                  forceUpdate(n => n + 1);
                }
              }
            }}
            aria-label={
              embedded
                ? `Select ${track.name}`
                : isHero
                ? `Play ${track.name}`
                : `Browse to ${track.name}`
            }
          >
            {/* Card face */}
            <div
              className="w-full h-full rounded-3xl flex flex-col items-center justify-center gap-2 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${track.color} 0%, ${lightenHex(track.color)} 100%)`,
                border:     isHero ? "2px solid rgba(255,255,255,0.18)" : "2px solid transparent",
                boxShadow:  isHero
                  ? `0 24px 64px rgba(0,0,0,0.45), 0 0 40px ${track.color}40, 0 0 0 1px rgba(255,255,255,0.06)`
                  : "none",
              }}
            >
              {/* Glare highlight */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse at 35% 18%, rgba(255,255,255,0.22) 0%, transparent 65%)",
                }}
              />

              {/* Equalizer bars — hero card + currently playing */}
              {isHero && isActive && isPlaying && (
                <div className="absolute top-3 right-3 flex items-end gap-[3px]">
                  {[12, 18, 10, 16, 8].map((h, i) => (
                    <div
                      key={i}
                      className="w-[3px] rounded-full bg-white/75"
                      style={{
                        height:          embedded ? Math.round(h * 0.8) : h,
                        transformOrigin: "bottom",
                        animation:       `eq-bar 0.7s ease-in-out ${i * 0.13}s infinite alternate`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* PLAY badge — standalone mode only, hero card, not playing */}
              {!embedded && isHero && !(isActive && isPlaying) && (
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-1 z-10 pointer-events-none">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-white">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span className="text-white text-[10px] font-bold tracking-wide">PLAY</span>
                </div>
              )}

              {/* Favourite heart — hero card only */}
              {isHero && (
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavouriteBeat(track.name); }}
                  className="absolute top-3 left-3 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/30 transition-colors cursor-pointer"
                  aria-label={isFav ? `Remove ${track.name} from favourites` : `Add ${track.name} to favourites`}
                  aria-pressed={isFav}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4"
                    style={{ transition: "fill 0.2s, stroke 0.2s" }}
                    fill={isFav ? "#A56B7C" : "none"}
                    stroke={isFav ? "#A56B7C" : "white"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              )}

              {/* Icon */}
              <div className="text-white/90 z-10">
                <Icon
                  name={track.icon}
                  size={isHero ? (embedded ? 52 : 68) : (embedded ? 38 : 52)}
                />
              </div>

              {/* Track name + duration */}
              <div className="text-center z-10 px-4">
                <p
                  className="text-white font-bold leading-tight tracking-tight"
                  style={{ fontSize: isHero ? (embedded ? 18 : 22) : (embedded ? 13 : 17) }}
                >
                  {track.name}
                </p>

                {isHero && (
                  <p
                    className="text-white/60 mt-1 font-medium tabular-nums"
                    style={{ fontSize: embedded ? 11 : 12 }}
                  >
                    {formatTime(parseDuration(track.duration))}
                    {track.fadeOutDuration ? " · fades" : ""}
                  </p>
                )}
              </div>

              {/* Short description — standalone hero only */}
              {!embedded && isHero && (
                <p className="text-white/55 text-[12px] leading-relaxed text-center px-6 z-10 line-clamp-2">
                  {track.description.split("—")[0].split("·")[0].trim()}
                </p>
              )}
            </div>
          </div>
        );
      })}

      {/* Prev / Next arrow buttons */}
      <button
        onClick={() => go(-1)}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center bg-[var(--background-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--primary)] transition-all cursor-pointer"
        aria-label="Previous track"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
        </svg>
      </button>

      <button
        onClick={() => go(1)}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center bg-[var(--background-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--primary)] transition-all cursor-pointer"
        aria-label="Next track"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
        </svg>
      </button>
    </div>
  );

  // ── Dot indicators ──────────────────────────────────────────────────────────

  const dots = (
    <div className={`flex justify-center gap-2 ${embedded ? "mt-2" : "mt-5"}`}>
      {displayTracks.map((t, i) => (
        <button
          key={t.name}
          onClick={() => {
            browseTrackRef.current = t.name;
            forceUpdate(n => n + 1);
            if (embedded) onSelect(tracks.indexOf(t));
          }}
          className="rounded-full transition-all duration-300 cursor-pointer"
          style={{
            width:      i === browseIndex ? 20 : 8,
            height:     8,
            background: i === browseIndex ? "var(--primary)" : "var(--border-color)",
          }}
          aria-label={`Select track ${i + 1}`}
        />
      ))}
    </div>
  );

  // ── Embedded: bare carousel + dots (no section wrapper or heading) ──────────

  if (embedded) {
    return (
      <div>
        {carouselTrack}
        {dots}
      </div>
    );
  }

  // ── Standalone: full section with "Audio Library" heading ───────────────────

  return (
    <section id="library" className="my-20">
      <h2 className="text-[40px] font-bold mb-10 text-center tracking-tight text-[var(--text-primary)]">
        Audio Library
      </h2>
      {carouselTrack}
      {dots}
    </section>
  );
}
