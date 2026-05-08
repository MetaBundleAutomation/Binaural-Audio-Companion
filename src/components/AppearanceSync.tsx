"use client";

import { useEffect } from "react";
import { usePreferences } from "@/hooks/usePreferences";

const THEME_CLASSES    = ["theme-army", "theme-airforce", "theme-midnight"] as const;
const BRIGHTNESS_CLASSES = ["brightness-dim", "brightness-bright"] as const;

/**
 * Invisible component that keeps the <html> theme and brightness classes in
 * sync with stored preferences across all pages. Rendered once in layout.tsx.
 */
export default function AppearanceSync() {
  const { prefs, isHydrated } = usePreferences();

  useEffect(() => {
    if (!isHydrated) return;

    // Theme — navy is the default (no class needed)
    document.documentElement.classList.remove(...THEME_CLASSES);
    if (prefs.theme !== "navy") {
      document.documentElement.classList.add(`theme-${prefs.theme}`);
    }
  }, [prefs.theme, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;

    // Brightness
    document.documentElement.classList.remove(...BRIGHTNESS_CLASSES);
    if (prefs.brightness !== "default") {
      document.documentElement.classList.add(`brightness-${prefs.brightness}`);
    }
  }, [prefs.brightness, isHydrated]);

  return null;
}
