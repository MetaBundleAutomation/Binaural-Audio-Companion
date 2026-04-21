"use client";

import { createContext, useContext } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Preferences {
  lastBeatId:       string | null;   // track name e.g. "Focus"
  lastNoiseId:      string | null;   // "white" | "pink" | "brown"
  lastVolume:       number;          // 0–100
  lastLoopState:    boolean;
  defaultBeatId:    string | null;
  defaultNoiseId:   string | null;
  defaultVolume:    number;          // 0–100, default 30
  defaultLoopState: boolean;
  launchScreen:     "home" | "library" | "lastPlayed";
  favouriteBeats:   string[];        // track names
  favouriteNoises:  string[];        // noise type strings
  brightness:       "dim" | "default" | "bright";
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_PREFERENCES: Preferences = {
  lastBeatId:       null,
  lastNoiseId:      null,
  lastVolume:       30,
  lastLoopState:    false,
  defaultBeatId:    null,
  defaultNoiseId:   null,
  defaultVolume:    30,
  defaultLoopState: false,
  launchScreen:     "home",
  favouriteBeats:   [],
  favouriteNoises:  [],
  brightness:       "default",
};

// ─── localStorage key map ─────────────────────────────────────────────────────

export const PREF_KEYS: Record<keyof Preferences, string> = {
  lastBeatId:       "crux:lastBeatId",
  lastNoiseId:      "crux:lastNoiseId",
  lastVolume:       "crux:lastVolume",
  lastLoopState:    "crux:lastLoopState",
  defaultBeatId:    "crux:defaultBeatId",
  defaultNoiseId:   "crux:defaultNoiseId",
  defaultVolume:    "crux:defaultVolume",
  defaultLoopState: "crux:defaultLoopState",
  launchScreen:     "crux:launchScreen",
  favouriteBeats:   "crux:favouriteBeats",
  favouriteNoises:  "crux:favouriteNoises",
  brightness:       "crux:brightness",
};

// Keys cleared by "Reset to app defaults" (auto-saved "last*" are intentionally excluded)
export const RESETTABLE_KEYS: (keyof Preferences)[] = [
  "defaultBeatId",
  "defaultNoiseId",
  "defaultVolume",
  "defaultLoopState",
  "launchScreen",
  "brightness",
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
