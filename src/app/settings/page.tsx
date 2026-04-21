"use client";

import React, { useEffect } from "react";
import { tracks } from "@/data/tracks";
import { usePreferences } from "@/hooks/usePreferences";
import type { Preferences } from "@/hooks/usePreferences";

// ─── Constants ────────────────────────────────────────────────────────────────

const NOISE_OPTIONS: { id: string; label: string }[] = [
  { id: "white", label: "White Noise" },
  { id: "pink",  label: "Pink Noise"  },
  { id: "brown", label: "Brown Noise" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  formatLabel?: (v: T) => string;
}) {
  return (
    <div className="flex gap-2">
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

  // Keep <html> class in sync with stored brightness while on this page
  useEffect(() => {
    if (isHydrated) applyBrightness(prefs.brightness);
  }, [prefs.brightness, isHydrated]);

  function handleBrightness(level: Preferences["brightness"]) {
    set("brightness", level);
    applyBrightness(level);
  }

  function handleReset() {
    if (
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
              {[1, 2, 3, 4, 5, 6].map(i => (
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
              Choose how CRUX opens for you each time.
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

              {/* Loop by default */}
              <Card>
                <div className="flex items-center justify-between gap-6">
                  <div>
                    <p className="font-semibold text-[var(--text-primary)] mb-1">Loop by default</p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Beats play continuously unless you turn loop off manually.
                    </p>
                  </div>
                  <button
                    role="switch"
                    aria-checked={prefs.defaultLoopState}
                    aria-label="Loop by default"
                    onClick={() => set("defaultLoopState", !prefs.defaultLoopState)}
                    className={`relative shrink-0 w-12 h-6 rounded-full border-0 cursor-pointer transition-colors ${
                      prefs.defaultLoopState ? "bg-[var(--primary)]" : "bg-[var(--border-color)]"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        prefs.defaultLoopState ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </Card>

              {/* Launch screen */}
              <Card>
                <ControlLabel
                  label="Launch screen"
                  description="Which screen opens when you start CRUX."
                />
                <SegmentedControl
                  options={["home", "library", "lastPlayed"] as const}
                  value={prefs.launchScreen}
                  onChange={v => set("launchScreen", v)}
                  formatLabel={v =>
                    v === "lastPlayed" ? "Last played"
                    : v.charAt(0).toUpperCase() + v.slice(1)
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

          {/* ── Brightness ─────────────────────────────────────────────────── */}
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">Brightness</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Adjust screen brightness to suit your environment or time of day.
            </p>
            <Card>
              <SegmentedControl
                options={["dim", "default", "bright"] as const}
                value={prefs.brightness}
                onChange={handleBrightness}
                formatLabel={v => v.charAt(0).toUpperCase() + v.slice(1)}
              />
            </Card>
          </div>

        </div>
      </section>
    </main>
  );
}
