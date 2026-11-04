import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Visitor } from "@/lib/visitor";

/**
 * Supabase powers the room (live chat + who's here) and the live numbers on
 * the About page. The browser talks to it with the public key only; what that
 * key may do is pinned down by the row-level-security policies in
 * `supabase/migrations/`. When the two env vars are missing (local dev, or a
 * deploy that hasn't been set up yet) every helper here is a quiet no-op.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

/** The realtime channel shared by the chat and the About page's live count. */
export const ROOM_CHANNEL = "crux-room";

export interface RoomMessage {
  id: number;
  visitor_id: string;
  name: string;
  body: string;
  created_at: string;
}

export interface LiveStats {
  /** One entry per day for the last 90 days, oldest first. `day` is YYYY-MM-DD (Sydney time). */
  daily: { day: string; visitors: number }[];
  visitors_7d: number;
  visitors_30d: number;
  visitors_90d: number;
  total_visits: number;
  total_play_hours: number;
  /** Top three by listening time over the last 30 days. */
  top_played: { tool: string; item: string; seconds: number; plays: number }[];
}

let client: SupabaseClient | null = null;

/** The shared browser client, or `null` on the server / when not configured. */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured || typeof window === "undefined") return null;
  if (!client) {
    client = createClient(url as string, anonKey as string, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }
  return client;
}

/** Record that this visitor opened the app. Fire-and-forget. */
export async function logVisit(visitor: Visitor): Promise<void> {
  const db = getSupabase();
  if (!db) return;
  try {
    await db.from("visits").insert({ visitor_id: visitor.id, name: visitor.name });
  } catch {
    // Never let logging surface to the person.
  }
}

/** Record a finished tool run. Fire-and-forget. */
export async function logPlay(
  visitorId: string,
  tool: string,
  item: string,
  seconds: number,
): Promise<void> {
  const db = getSupabase();
  if (!db) return;
  try {
    await db.from("plays").insert({
      visitor_id: visitorId,
      tool,
      item,
      seconds: Math.max(0, Math.min(86400, Math.round(seconds))),
    });
  } catch {
    // Never let logging surface to the person.
  }
}

/** The numbers for the About page, or `null` when unavailable. */
export async function fetchLiveStats(): Promise<LiveStats | null> {
  const db = getSupabase();
  if (!db) return null;
  try {
    const { data, error } = await db.rpc("live_stats");
    if (error || !data) return null;
    return data as LiveStats;
  } catch {
    return null;
  }
}
