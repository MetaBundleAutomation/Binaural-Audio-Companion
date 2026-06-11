"use client";

import { createContext, useContext } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Preferences {
  lastBeatId:       string | null;   // track name e.g. "Focus"
  lastNoiseId:      string | null;   // "white" | "pink" | "brown"
  lastVolume:       number;          // 0–100
  lastNoiseVolume:  number;          // 0–100, auto-saved noise therapy slider
  defaultBeatId:    string | null;
  defaultNoiseId:   string | null;
  defaultVolume:    number;          // 0–100, default 30
  launchScreen:     "home" | "player" | "noise" | "box-breathing";
  favouriteBeats:   string[];        // track names
  favouriteNoises:  string[];        // noise type strings
  brightness:         "dim" | "default" | "bright";
  theme:              "navy" | "army" | "airforce" | "midnight";
  showAromatherapy:   boolean;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_PREFERENCES: Preferences = {
  lastBeatId:       null,
  lastNoiseId:      null,
  lastVolume:       30,
  lastNoiseVolume:  30,
  defaultBeatId:    null,
  defaultNoiseId:   null,
  defaultVolume:    30,
  launchScreen:     "home" as const,
  favouriteBeats:   [],
  favouriteNoises:  [],
  brightness:         "default",
  theme:              "navy" as const,
  showAromatherapy:   true,
};

// ─── localStorage key map ─────────────────────────────────────────────────────

export const PREF_KEYS: Record<keyof Preferences, string> = {
  lastBeatId:       "crux:lastBeatId",
  lastNoiseId:      "crux:lastNoiseId",
  lastVolume:       "crux:lastVolume",
  lastNoiseVolume:  "crux:lastNoiseVolume",
  defaultBeatId:    "crux:defaultBeatId",
  defaultNoiseId:   "crux:defaultNoiseId",
  defaultVolume:    "crux:defaultVolume",
  launchScreen:     "crux:launchScreen",
  favouriteBeats:   "crux:favouriteBeats",
  favouriteNoises:  "crux:favouriteNoises",
  brightness:         "crux:brightness",
  theme:              "crux:theme",
  showAromatherapy:   "crux:showAromatherapy",
};

// Keys cleared by "Reset to app defaults" (auto-saved "last*" are intentionally excluded)
export const RESETTABLE_KEYS: (keyof Preferences)[] = [
  "defaultBeatId",
  "defaultNoiseId",
  "defaultVolume",
  "launchScreen",
  "brightness",
  "theme",
  "showAromatherapy",
];

// ─── Context ──────────────────────────────────────────────────────────────────

export interface PreferencesContextValue {
  prefs:                Preferences;
  isHydrated:           boolean;
  set:                  <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  toggleFavouriteBeat:  (id: string) => void;
  toggleFavouriteNoise: (id: string) => void;
  resetDefaults:        () => void;
}

export const PreferencesContext = createContext<PreferencesContextValue | null>(null);

// ─── Hook ─────────────────────────────────────────────────────────────────────

/** Read and update user preferences from anywhere in the component tree. */
export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be called inside <PreferencesProvider>");
  return ctx;
}
