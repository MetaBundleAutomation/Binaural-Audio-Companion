"use client";

import { useEffect } from "react";
import { usePreferences } from "@/hooks/usePreferences";

/**
 * Invisible component that keeps the <html> brightness class in sync with the
 * stored preference across all pages. Rendered once inside PreferencesProvider
 * in layout.tsx so it runs globally without prop drilling.
 */
export default function BrightnessSync() {
  const { prefs, isHydrated } = usePreferences();

  useEffect(() => {
    if (!isHydrated) return;
    document.documentElement.classList.remove("brightness-dim", "brightness-bright");
    if (prefs.brightness !== "default") {
      document.documentElement.classList.add(`brightness-${prefs.brightness}`);
    }
  }, [prefs.brightness, isHydrated]);

  return null;
}
