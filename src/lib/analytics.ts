import { track } from "@vercel/analytics";

/**
 * Usage analytics — thin wrapper over Vercel Web Analytics custom events.
 *
 * Every tool run sends two kinds of event, so the dashboard's Events panel
 * shows both a roll-up row per tool and a row per tool-and-item:
 *
 *   Roll-up (one row per phase, split by the `tool` / `item` properties)
 *     tool_start   { tool, item }
 *     tool_5min    { tool, item }   every 5 minutes of use → count × 5 = minutes
 *     tool_stop    { tool, length } `length` is a bucket, e.g. "5-15m"
 *
 *   Per item (one row per tool + item, e.g. binaural_focus_start)
 *     <tool>_<item>_start  { tool, item }
 *     <tool>_<item>_5min   { tool, item }
 *     <tool>_<item>_stop   { tool, length }
 *
 * Plus:
 *     session_5min   (no props)   every 5 minutes the app is open and visible
 *                                 → count × 5 / 60 = hours of use
 *     session_end    { length }   the visit ended; `length` is a bucket
 *     quiz_start     (no props)   the Your Brain quick check was started
 *     quiz_complete  { score }    it was finished, e.g. "7/9"
 *
 * Examples of per-item names: binaural_focus_5min, binaural_60_bpm_bilateral_start,
 * noise_heavyrain_stop, noise_puretone_start, box_breathing_sarah_start,
 * coherence_gentle_5min, body_scan_ben_stop.
 *
 * Constraints that shaped this:
 *   - Vercel Pro allows at most 2 custom properties per event. Every event
 *     here uses two or fewer. (Web Analytics Plus raises that to 8.) The number
 *     of distinct event names is not limited, which is why tool and item go in
 *     the name as well.
 *   - The dashboard shows event counts and lets you split by a property's
 *     values. It never sums a number, which is why durations are sent as
 *     buckets plus a heartbeat count rather than as raw seconds.
 *   - Values are limited to strings, numbers, booleans and null, and 255
 *     characters each.
 *
 * In development the Vercel script runs in debug mode: events are logged to
 * the browser console and nothing is sent.
 */

export type ToolId =
  | "binaural"
  | "noise"
  | "box-breathing"
  | "coherence"
  | "body-scan"
  | "quiz";

export type ToolPhase = "start" | "5min" | "stop";

export type LengthBucket = "<1m" | "1-5m" | "5-15m" | "15-30m" | "30-60m" | "60m+";

/** How often the heartbeat events fire while a tool (or the app) is in use. */
export const HEARTBEAT_MS = 5 * 60 * 1000;

type EventProps = Record<string, string | number | boolean | null>;

/** Send a custom event. Never throws, and does nothing during server rendering. */
export function trackEvent(name: string, props?: EventProps): void {
  if (typeof window === "undefined") return;
  try {
    track(name, props);
  } catch {
    // Analytics must never break the app.
  }
}

/**
 * Make a label safe for an event name: lower-case, letters and digits only,
 * underscores between words. "60 BPM Bilateral" → "60_bpm_bilateral".
 */
export function eventSlug(label: string): string {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return slug || "unknown";
}

/** The per-item event name, e.g. toolEventName("binaural", "Focus", "start") → "binaural_focus_start". */
export function toolEventName(tool: ToolId, item: string, phase: ToolPhase): string {
  return `${eventSlug(tool)}_${eventSlug(item)}_${phase}`;
}

/** Collapse a duration in seconds into the bucket the dashboard can split on. */
export function lengthBucket(seconds: number): LengthBucket {
  if (seconds < 60) return "<1m";
  if (seconds < 5 * 60) return "1-5m";
  if (seconds < 15 * 60) return "5-15m";
  if (seconds < 30 * 60) return "15-30m";
  if (seconds < 60 * 60) return "30-60m";
  return "60m+";
}
