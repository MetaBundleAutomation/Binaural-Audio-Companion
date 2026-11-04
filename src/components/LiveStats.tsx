"use client";

import { useEffect, useState } from "react";
import {
  fetchLiveStats,
  getSupabase,
  isSupabaseConfigured,
  ROOM_CHANNEL,
  type LiveStats as LiveStatsData,
} from "@/lib/supabase";
import { getVisitor } from "@/lib/visitor";
import UsageChart from "./UsageChart";

/**
 * The "Right now" card on the About page: who is here, how many people have
 * visited, a visitors-per-day chart and the most-played sessions. Everything
 * here is anonymous and nothing here may throw — a missing number is shown as
 * a quiet line, never an error.
 */

const REFRESH_MS = 60_000;
const RANGES = [7, 30, 90] as const;
type Range = (typeof RANGES)[number];

const TOOL_NAMES: Record<string, string> = {
  binaural: "Binaural Beats",
  noise: "Noise Therapy",
  "box-breathing": "Box Breathing",
  coherence: "Coherence",
  "body-scan": "Body Scan",
};

const ITEM_NAMES: Record<string, string> = {
  white: "White Noise",
  pink: "Pink Noise",
  brown: "Brown Noise",
  green: "Green Noise",
  heavyrain: "Heavy Rain",
  runningwater: "Rainforest Waterfall",
  oceanwaves: "Ocean Waves",
  puretone: "Pure Tone",
  les: "Les",
  sarah: "Sarah",
  john: "John",
  julie: "Julie",
  "no-voice": "no voice",
  gentle: "Gentle",
  balanced: "Balanced",
  deeper: "Deeper",
};

function titleCase(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function prettyTool(tool: unknown): string {
  const key = String(tool ?? "").trim();
  return TOOL_NAMES[key] ?? (key ? titleCase(key) : "Unknown");
}

function prettyItem(item: unknown): string {
  const raw = String(item ?? "").trim();
  if (!raw) return "";
  const mapped = ITEM_NAMES[raw.toLowerCase()];
  if (mapped) return mapped;
  // Track names and narrators already arrive capitalised ("Focus", "60 BPM Bilateral", "Ben").
  if (/[A-Z]/.test(raw)) return raw;
  return titleCase(raw);
}

function formatCount(n: unknown): string {
  return (Math.max(0, Math.round(Number(n) || 0))).toLocaleString("en-AU");
}

function formatHours(hours: unknown): string {
  const h = Math.max(0, Number(hours) || 0);
  return h.toLocaleString("en-AU", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function formatListening(seconds: unknown): string {
  const s = Math.max(0, Number(seconds) || 0);
  if (s < 60) return "under a minute";
  if (s < 3600) return `${Math.round(s / 60)} min`;
  return `${formatHours(s / 3600)} h`;
}

function hereNowLine(total: number, includesMe: boolean): string {
  if (total === 0 || (total === 1 && includesMe)) return "Just you right now";
  if (total === 1) return "1 person here now";
  return `${total.toLocaleString("en-AU")} people here now`;
}

function Skeleton({ className }: { className: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-xl bg-[var(--background-light)] ${className}`} />;
}

function Muted({ children }: { children: React.ReactNode }) {
  return <p className="text-[15px] text-[var(--text-secondary)]">{children}</p>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[15px] font-bold text-[var(--text-primary)]">{children}</h3>;
}

export default function LiveStats() {
  // `undefined` = still loading, `null` = nothing could be fetched.
  const [stats, setStats] = useState<LiveStatsData | null | undefined>(undefined);
  const [here, setHere] = useState({ total: 0, includesMe: false });
  const [range, setRange] = useState<Range>(30);

  // The numbers, refreshed every minute while the card is on screen.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    const load = async () => {
      try {
        const next = await fetchLiveStats();
        // A failed refresh keeps the last good numbers on screen.
        if (!cancelled) setStats((prev) => next ?? prev ?? null);
      } catch {
        if (!cancelled) setStats((prev) => prev ?? null);
      }
    };

    void load();
    const timer = window.setInterval(() => void load(), REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  // Who is here right now, via presence on the shared room channel.
  useEffect(() => {
    const db = getSupabase();
    if (!db) return;
    const visitor = getVisitor();
    const channel = db.channel(ROOM_CHANNEL);

    channel
      .on("presence", { event: "sync" }, () => {
        try {
          const state = channel.presenceState<{ id?: string }>();
          const ids = new Set<string>();
          for (const presences of Object.values(state)) {
            for (const presence of presences) {
              if (typeof presence.id === "string" && presence.id) ids.add(presence.id);
            }
          }
          setHere({ total: ids.size, includesMe: visitor ? ids.has(visitor.id) : false });
        } catch {
          // Leave the last count in place.
        }
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED" && visitor) {
          void channel.track({ id: visitor.id, name: visitor.name }).catch(() => undefined);
        }
      });

    return () => {
      void db.removeChannel(channel);
    };
  }, []);

  if (!isSupabaseConfigured) {
    return <Muted>Live numbers are being switched on.</Muted>;
  }

  const liveLine = (
    <p className="flex items-center gap-2.5 text-[15px] font-semibold text-[var(--text-primary)]">
      <span aria-hidden="true" className="inline-block w-2.5 h-2.5 rounded-full bg-[var(--primary)] shrink-0" />
      {hereNowLine(here.total, here.includesMe)}
    </p>
  );

  if (stats === undefined) {
    return (
      <div className="flex flex-col gap-6" aria-busy="true">
        {liveLine}
        <span className="sr-only">Loading live numbers</span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {RANGES.map((r) => <Skeleton key={r} className="h-[84px]" />)}
          <Skeleton className="h-[84px]" />
        </div>
        <Skeleton className="h-[180px]" />
        <Skeleton className="h-[140px]" />
      </div>
    );
  }

  if (stats === null) {
    return (
      <div className="flex flex-col gap-4">
        {liveLine}
        <Muted>Live numbers are taking a breather.</Muted>
      </div>
    );
  }

  const daily = Array.isArray(stats.daily) ? stats.daily : [];
  const topPlayed = Array.isArray(stats.top_played) ? stats.top_played.slice(0, 3) : [];
  const tiles = [
    { label: "Last 7 days", value: formatCount(stats.visitors_7d) },
    { label: "Last 30 days", value: formatCount(stats.visitors_30d) },
    { label: "Last 90 days", value: formatCount(stats.visitors_90d) },
    { label: "Hours listened", value: formatHours(stats.total_play_hours) },
  ];

  return (
    <div className="flex flex-col gap-7">
      {liveLine}

      {/* Headline numbers */}
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {tiles.map(({ label, value }) => (
          <div
            key={label}
            className="flex flex-col-reverse rounded-xl px-4 py-4 border border-[var(--border-color)] bg-[var(--background-light)]"
          >
            <dt className="mt-1 text-[12px] uppercase tracking-widest text-[var(--text-secondary)]">
              {label}
            </dt>
            <dd className="text-[28px] font-bold leading-tight text-[var(--text-primary)]">{value}</dd>
          </div>
        ))}
      </dl>

      {/* Visitors per day */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <SectionTitle>Visitors per day</SectionTitle>
          <div
            role="group"
            aria-label="Days shown"
            className="inline-flex p-1 rounded-full border border-[var(--border-color)] bg-[var(--background-light)]"
          >
            {RANGES.map((r) => {
              const active = r === range;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  aria-pressed={active}
                  className={`min-h-9 min-w-11 px-3 rounded-full text-[13px] font-semibold transition-all cursor-pointer ${
                    active
                      ? "bg-[var(--primary-dark)] text-white"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {r}
                  <span className="sr-only"> days</span>
                </button>
              );
            })}
          </div>
        </div>
        <UsageChart days={range} data={daily.slice(-range)} />
      </div>

      {/* Most played */}
      <div>
        <SectionTitle>Most played, last 30 days</SectionTitle>
        {topPlayed.length === 0 ? (
          <p className="mt-3 text-[15px] text-[var(--text-secondary)]">Nothing yet — be the first.</p>
        ) : (
          <ol className="mt-3 flex flex-col gap-2.5">
            {topPlayed.map((entry, i) => (
              <li
                key={`${entry.tool}-${entry.item}-${i}`}
                className="flex items-center gap-3 min-h-12 px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--background-light)]"
              >
                <span
                  aria-hidden="true"
                  className="w-7 h-7 shrink-0 rounded-full bg-[var(--primary)] text-white text-[13px] font-bold flex items-center justify-center"
                >
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold leading-snug text-[var(--text-primary)] truncate">
                    {prettyTool(entry.tool)}
                  </span>
                  {prettyItem(entry.item) && (
                    <span className="block text-[13px] leading-snug text-[var(--text-secondary)] truncate">
                      {prettyItem(entry.item)}
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-[13px] text-[var(--text-secondary)] whitespace-nowrap">
                  {formatListening(entry.seconds)} · {formatCount(entry.plays)} {Number(entry.plays) === 1 ? "play" : "plays"}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <p className="text-[13px] text-[var(--text-secondary)]">
        Counts are anonymous. Nobody is identified, and there are no accounts.
      </p>
    </div>
  );
}
