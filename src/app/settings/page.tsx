"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { tracks } from "@/data/tracks";
import { usePreferences } from "@/hooks/usePreferences";
import type { Preferences } from "@/hooks/usePreferences";

// ─── Constants ────────────────────────────────────────────────────────────────

const NOISE_OPTIONS: { id: string; label: string }[] = [
  { id: "white",        label: "White Noise"                },
  { id: "pink",         label: "Pink Noise"                 },
  { id: "brown",        label: "Brown Noise"                },
  { id: "green",        label: "Green Noise"                },
  { id: "heavyrain",    label: "Heavy Rain"                 },
  { id: "runningwater", label: "Gentle Rainforest Waterfall"},
  { id: "oceanwaves",   label: "Gentle Ocean Waves"         },
];

// ─── Theme metadata ───────────────────────────────────────────────────────────

const THEMES: {
  id:      Preferences["theme"];
  label:   string;
  swatch:  string;   // accent colour for the preview dot
  bg:      string;   // background colour for the preview dot ring
}[] = [
  { id: "airforce", label: "Air Force", swatch: "#5592E8", bg: "#0D1830" },
  { id: "army",     label: "Army",      swatch: "#7A8C38", bg: "#131610" },
  { id: "midnight", label: "Midnight",  swatch: "#3A7080", bg: "#08090C" },
  { id: "navy",     label: "Navy",      swatch: "#2878A8", bg: "#0E1822" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function applyTheme(theme: Preferences["theme"]) {
  document.documentElement.classList.remove("theme-army", "theme-airforce", "theme-midnight");
  if (theme !== "navy") {
    document.documentElement.classList.add(`theme-${theme}`);
  }
}

function applyBrightness(level: Preferences["brightness"]) {
  document.documentElement.classList.remove("brightness-dim", "brightness-bright");
  if (level !== "default") {
    document.documentElement.classList.add(`brightness-${level}`);
  }
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[var(--background-card)] rounded-2xl p-6 border border-[var(--border-color)]">
      {children}
    </div>
  );
}

function ControlLabel({ htmlFor, label, description }: { htmlFor?: string; label: string; description: string }) {
  return (
    <>
      {htmlFor
        ? <label htmlFor={htmlFor} className="block font-semibold text-[var(--text-primary)] mb-1">{label}</label>
        : <p className="font-semibold text-[var(--text-primary)] mb-1">{label}</p>
      }
      <p className="text-sm text-[var(--text-secondary)] mb-3">{description}</p>
    </>
  );
}

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  formatLabel,
  className,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  formatLabel?: (v: T) => string;
  className?: string;
}) {
  return (
    <div className={className ?? "flex gap-2"}>
      {options.map(option => (
        <button
          key={option}
          onClick={() => onChange(option)}
          aria-pressed={value === option}
          className="flex-1 py-2 px-3 rounded-xl text-[13px] font-semibold transition-all cursor-pointer"
          style={value === option ? {
            background: "var(--primary)",
            color: "white",
            boxShadow: "0 4px 12px rgba(43,107,127,0.35)",
          } : {
            background: "var(--background-light)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border-color)",
          }}
        >
          {formatLabel ? formatLabel(option) : option.charAt(0).toUpperCase() + option.slice(1)}
        </button>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { prefs, set, resetDefaults, isHydrated } = usePreferences();

  // Keep <html> classes in sync with stored appearance while on this page
  useEffect(() => {
    if (!isHydrated) return;
    applyTheme(prefs.theme);
    applyBrightness(prefs.brightness);
  }, [prefs.theme, prefs.brightness, isHydrated]);

  function handleTheme(theme: Preferences["theme"]) {
    set("theme", theme);
    applyTheme(theme);
  }

  function handleBrightness(level: Preferences["brightness"]) {
    set("brightness", level);
    applyBrightness(level);
  }

  function handleReset() {
    if (
      typeof window !== "undefined" &&
      window.confirm(
        "Reset all My Defaults to app defaults?\n\nYour auto-saved history (last beat, last volume) won't be affected.",
      )
    ) {
      resetDefaults();
    }
  }

  // Skeleton: avoid flashing server-render defaults before localStorage hydrates
  if (!isHydrated) {
    return (
      <main className="min-h-screen">
        <section className="py-20 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="h-10 w-40 bg-[var(--border-color)] rounded-lg animate-pulse mb-4 mx-auto" />
            <div className="h-5 w-72 bg-[var(--border-color)] rounded animate-pulse mb-12 mx-auto" />
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6, 7].map(i => (
                <div
                  key={i}
                  className="h-24 bg-[var(--background-card)] rounded-2xl border border-[var(--border-color)] animate-pulse"
                />
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto">

          <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-3 text-center">
            Settings
          </h1>
          <p className="text-lg text-[var(--text-secondary)] mb-12 text-center">
            Everything saves automatically — no save button needed.
          </p>

          {/* ── My Defaults ────────────────────────────────────────────────── */}
          <div className="mb-10">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">My Defaults</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Your defaults are what CRUX automatically picks for you each time you open it.
            </p>

            <div className="space-y-4">

              {/* Default Beat */}
              <Card>
                <ControlLabel
                  htmlFor="default-beat"
                  label="Default beat"
                  description="Pre-selected in the player each time you open the app."
                />
                <select
                  id="default-beat"
                  value={prefs.defaultBeatId ?? ""}
                  onChange={e => set("defaultBeatId", e.target.value || null)}
                  className="w-full rounded-xl px-4 py-2.5 text-[var(--text-primary)] bg-[var(--background-light)] border border-[var(--border-color)] text-[15px] cursor-pointer"
                >
                  <option value="">None — let me choose each time</option>
                  {tracks.map(t => (
                    <option key={t.name} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </Card>

              {/* Default Noise */}
              <Card>
                <ControlLabel
                  htmlFor="default-noise"
                  label="Default noise"
                  description="Pre-selected in Noise Therapy each time you open the app."
                />
                <select
                  id="default-noise"
                  value={prefs.defaultNoiseId ?? ""}
                  onChange={e => set("defaultNoiseId", e.target.value || null)}
                  className="w-full rounded-xl px-4 py-2.5 text-[var(--text-primary)] bg-[var(--background-light)] border border-[var(--border-color)] text-[15px] cursor-pointer"
                >
                  <option value="">None — let me choose each time</option>
                  {NOISE_OPTIONS.map(n => (
                    <option key={n.id} value={n.id}>{n.label}</option>
                  ))}
                </select>
              </Card>

              {/* Default Volume */}
              <Card>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="default-volume" className="font-semibold text-[var(--text-primary)]">
                    Default volume
                  </label>
                  <span className="text-sm font-semibold tabular-nums text-[var(--primary)]">
                    {prefs.defaultVolume}%
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-3">
                  Starting volume when the player loads. 30% is a safe starting point.
                </p>
                <input
                  id="default-volume"
                  type="range"
                  min={0}
                  max={100}
                  value={prefs.defaultVolume}
                  onChange={e => set("defaultVolume", Number(e.target.value))}
                  className="w-full"
                  style={{ "--fill": `${prefs.defaultVolume}%` } as React.CSSProperties}
                  aria-label="Default volume"
                />
              </Card>

              {/* Launch screen */}
              <Card>
                <ControlLabel
                  label="Launch screen"
                  description="Choose which section CRUX scrolls to when you open the app."
                />
                <SegmentedControl
                  options={["home", "player", "noise", "box-breathing"] as const}
                  value={prefs.launchScreen}
                  onChange={v => set("launchScreen", v)}
                  className="grid grid-cols-2 gap-2"
                  formatLabel={v =>
                    v === "player"        ? "Binaural Beats" :
                    v === "noise"         ? "Noise Therapy"  :
                    v === "box-breathing" ? "Box Breathing"  :
                    "Home"
                  }
                />
              </Card>

              {/* Box Breathing voice */}
              <Card>
                <ControlLabel
                  label="Box Breathing voice"
                  description="Choose which voice guides your box breathing session."
                />
                <SegmentedControl
                  options={["john", "sarah", "default", "julie"] as const}
                  value={prefs.boxBreathingVoice}
                  onChange={v => set("boxBreathingVoice", v)}
                  className="grid grid-cols-2 gap-2"
                  formatLabel={v =>
                    v === "sarah" ? "Sarah" :
                    v === "john"  ? "John"  :
                    v === "julie" ? "Julie" :
                    "Les"
                  }
                />
              </Card>

            </div>

            {/* Reset */}
            <div className="pt-4 text-center">
              <button
                onClick={handleReset}
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline underline-offset-2 cursor-pointer transition-colors"
              >
                Reset to app defaults
              </button>
            </div>
          </div>

          <hr className="border-[var(--border-color)] mb-10" />

          {/* ── Personalisation ────────────────────────────────────────────── */}
          <div className="mb-10">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">Personalisation</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Tailor the CRUX experience to how you like it.
            </p>

            <div className="space-y-4">
              <Card>
                <div className="flex items-center justify-between gap-6">
                  <div>
                    <p className="font-semibold text-[var(--text-primary)] mb-1">
                      Aromatherapy suggestions
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Show an essential oil pairing recommendation above the player.
                    </p>
                  </div>
                  <button
                    role="switch"
                    aria-checked={prefs.showAromatherapy}
                    aria-label="Show aromatherapy suggestions"
                    onClick={() => set("showAromatherapy", !prefs.showAromatherapy)}
                    className={`relative shrink-0 w-12 h-6 rounded-full border-0 cursor-pointer transition-colors ${
                      prefs.showAromatherapy ? "bg-[var(--primary)]" : "bg-[var(--border-color)]"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        prefs.showAromatherapy ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </Card>
            </div>
          </div>

          <hr className="border-[var(--border-color)] mb-10" />

          {/* ── Appearance ─────────────────────────────────────────────────── */}
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">Appearance</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Choose a colour theme and adjust brightness to suit your environment.
            </p>

            <div className="space-y-4">

              {/* Theme picker */}
              <Card>
                <ControlLabel
                  label="Theme"
                  description="Sets the overall colour of the app."
                />
                <div className="grid grid-cols-2 gap-3">
                  {THEMES.map(t => {
                    const isSelected = prefs.theme === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => handleTheme(t.id)}
                        aria-pressed={isSelected}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all cursor-pointer"
                        style={isSelected ? {
                          background:  "var(--primary)",
                          color:       "white",
                          boxShadow:   "0 4px 12px rgba(0,0,0,0.3)",
                        } : {
                          background:  "var(--background-light)",
                          color:       "var(--text-secondary)",
                          border:      "1px solid var(--border-color)",
                        }}
                      >
                        {/* Swatch — two-tone circle showing bg + accent */}
                        <span
                          className="shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center"
                          style={{
                            background:   t.bg,
                            borderColor:  isSelected ? "rgba(255,255,255,0.5)" : t.swatch,
                          }}
                        >
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ background: t.swatch }}
                          />
                        </span>
                        <span className="text-[13px] font-semibold">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* Brightness */}
              <Card>
                <ControlLabel
                  label="Brightness"
                  description="Adjust to suit your environment or time of day."
                />
                <SegmentedControl
                  options={["dim", "default", "bright"] as const}
                  value={prefs.brightness}
                  onChange={handleBrightness}
                  formatLabel={v => v.charAt(0).toUpperCase() + v.slice(1)}
                />
              </Card>

            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/"
              className="inline-block px-8 py-3 rounded-lg text-base font-semibold text-white transition-all duration-300 hover:-translate-y-0.5"
              style={{ background: "var(--primary)", boxShadow: "var(--shadow)" }}
            >
              Start Listening
            </Link>
          </div>

        </div>
      </section>
    </main>
  );
}
