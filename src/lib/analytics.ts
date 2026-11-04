import { track } from "@vercel/analytics";

/**
 * Usage analytics — thin wrapper over Vercel Web Analytics custom events.
 *
 * What we measure (all aggregate, nothing identifies a person):
 *   tool_start    { tool, item }    a tool was started (play pressed, timer started)
 *   tool_5min     { tool, item }    sent after every 5 minutes of continuous use,
 *                                   so  count × 5  =  minutes of playtime per tool
 *   tool_stop     { tool, length }  the tool was stopped; `length` is a bucket
 *   session_5min  (no props)        every 5 minutes the app is open and visible,
 *                                   so  count × 5 / 60  =  hours of use
 *   session_end   { length }        the visit ended; `length` is a bucket
 *   quiz_start    (no props)        the Your Brain quick check was started
 *   quiz_complete { score }         it was finished, e.g. "7/9"
 *
 * Constraints that shaped this:
 *   - Vercel Pro allows at most 2 custom properties per event. Every event
 *     here uses two or fewer. (Web Analytics Plus raises that to 8.)
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

/** Collapse a duration in seconds into the bucket the dashboard can split on. */
export function lengthBucket(seconds: number): LengthBucket {
  if (seconds < 60) return "<1m";
  if (seconds < 5 * 60) return "1-5m";
  if (seconds < 15 * 60) return "5-15m";
  if (seconds < 30 * 60) return "15-30m";
  if (seconds < 60 * 60) return "30-60m";
  return "60m+";
}
