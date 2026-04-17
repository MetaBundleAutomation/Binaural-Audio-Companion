"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  PreferencesContext,
  DEFAULT_PREFERENCES,
  PREF_KEYS,
  RESETTABLE_KEYS,
} from "@/hooks/usePreferences";
import type { Preferences } from "@/hooks/usePreferences";

export default function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs]           = useState<Preferences>(DEFAULT_PREFERENCES);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage after first client render (SSR-safe — server
  // always renders with defaults, client patches in stored values immediately
  // after mount, before the user can interact).
  useEffect(() => {
    const loaded: Record<string, unknown> = {};
    (Object.entries(PREF_KEYS) as [keyof Preferences, string][]).forEach(
      ([key, storageKey]) => {
        const raw = localStorage.getItem(storageKey);
        if (raw !== null) {
          try {
            loaded[key] = JSON.parse(raw);
          } catch {
            // Malformed value — silently fall back to default
          }
        }
      },
    );
    setPrefs(prev => ({ ...prev, ...(loaded as Partial<Preferences>) }));
    setIsHydrated(true);
  }, []);

  /** Generic setter — updates React state and persists to localStorage */
  const set = useCallback(
    <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
      setPrefs(prev => ({ ...prev, [key]: value }));
      try {
        localStorage.setItem(PREF_KEYS[key], JSON.stringify(value));
      } catch {
        // Private browsing or storage quota exceeded — fail silently
      }
    },
    [],
  );

  /** Toggle a beat name in/out of favouriteBeats */
  const toggleFavouriteBeat = useCallback((id: string) => {
    setPrefs(prev => {
      const next = prev.favouriteBeats.includes(id)
        ? prev.favouriteBeats.filter(b => b !== id)
        : [...prev.favouriteBeats, id];
      try { localStorage.setItem(PREF_KEYS.favouriteBeats, JSON.stringify(next)); } catch {}
      return { ...prev, favouriteBeats: next };
    });
  }, []);

  /** Toggle a noise type in/out of favouriteNoises */
  const toggleFavouriteNoise = useCallback((id: string) => {
    setPrefs(prev => {
      const next = prev.favouriteNoises.includes(id)
        ? prev.favouriteNoises.filter(n => n !== id)
        : [...prev.favouriteNoises, id];
      try { localStorage.setItem(PREF_KEYS.favouriteNoises, JSON.stringify(next)); } catch {}
      return { ...prev, favouriteNoises: next };
    });
  }, []);

  /** Clear all "My Defaults" keys and revert to factory values */
  const resetDefaults = useCallback(() => {
    setPrefs(prev => {
      const next = { ...prev };
      RESETTABLE_KEYS.forEach(key => {
        Object.assign(next, { [key]: DEFAULT_PREFERENCES[key] });
        try { localStorage.removeItem(PREF_KEYS[key]); } catch {}
      });
      return next;
    });
  }, []);

  return (
    <PreferencesContext.Provider
      value={{ prefs, isHydrated, set, toggleFavouriteBeat, toggleFavouriteNoise, resetDefaults }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}
