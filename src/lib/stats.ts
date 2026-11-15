/**
 * The numbers behind the "CRUX in numbers" page (/stats).
 *
 * They come from Vercel Web Analytics, read on the server through Vercel's
 * Web Analytics query API (https://vercel.com/docs/analytics/web-analytics-api).
 * The browser never talks to Vercel and never sees the token. Responses are
 * cached for an hour, so the page costs about 30 API calls an hour however
 * many people open it.
 *
 * Nothing new is collected for this page. It reads the events CRUX already
 * sends (src/lib/analytics.ts):
 *   tool_start  { tool, item }   a session started
 *   tool_5min   { tool, item }   every 5 minutes of a session  → listening time
 *   tool_stop   { tool, length } a session ended, length bucketed
 *   quiz_start, quiz_complete { score }  the Your Brain check
 * plus Vercel's own page-view counts, device type and country.
 *
 * Settings (server-side environment variables, never NEXT_PUBLIC_):
 *   VERCEL_ANALYTICS_TOKEN    a Vercel access token for the metabundle team. Required.
 *   VERCEL_ANALYTICS_PROJECT  project name or id. Default "binaural-audio-companion".
 *   VERCEL_ANALYTICS_TEAM     team slug, or a team id starting "team_". Default "metabundle".
 *   VERCEL_ANALYTICS_API_URL  only for testing against a stand-in. Default https://api.vercel.com.
 *
 * Without a token the production site shows "not switched on yet". Preview and
 * local builds show clearly labelled sample numbers instead, so the design can
 * be reviewed before the real numbers are connected.
 *
 * What a "visit" is: Vercel counts a visitor with an anonymous hash that resets
 * every day, so one person on one day is one visit, and the same person on two
 * days is two. Nothing here identifies anyone.
 */

export const STATS_REVALIDATE_SECONDS = 3600;

/** How many days the detailed charts cover. Four whole weeks, so every weekday counts equally. */
export const WINDOW_DAYS = 28;

/** The day Vercel Web Analytics was switched on for CRUX, so "since launch" counts begin. */
export const COUNTING_SINCE = "2026-11-04";

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;
const TIME_ZONE = "Australia/Sydney";

export type ToolKey = "binaural" | "noise" | "box-breathing" | "coherence" | "body-scan";

export const TOOL_LABELS: Record<ToolKey, string> = {
  binaural: "Binaural Beats",
  noise: "Noise Therapy",
  "box-breathing": "Box Breathing",
  coherence: "Coherence Breathing",
  "body-scan": "Body Scan",
};

const TOOL_KEYS = Object.keys(TOOL_LABELS) as ToolKey[];

// The tools send short ids for some items. Same names as the About page card.
const ITEM_LABELS: Record<string, string> = {
  white: "White Noise",
  pink: "Pink Noise",
  brown: "Brown Noise",
  green: "Green Noise",
  heavyrain: "Heavy Rain",
  runningwater: "Rainforest Waterfall",
  oceanwaves: "Ocean Waves",
  puretone: "Pure Tone",
  les: "Les's voice",
  sarah: "Sarah's voice",
  john: "John's voice",
  julie: "Julie's voice",
  "no-voice": "No voice",
  gentle: "Gentle",
  balanced: "Balanced",
  deeper: "Deeper",
};

/** The session-length buckets sent with tool_stop, shortest first. */
export const LENGTH_BUCKETS = [
  { key: "<1m", label: "Under 1 min", minMinutes: 0 },
  { key: "1-5m", label: "1 to 5 min", minMinutes: 1 },
  { key: "5-15m", label: "5 to 15 min", minMinutes: 5 },
  { key: "15-30m", label: "15 to 30 min", minMinutes: 15 },
  { key: "30-60m", label: "30 to 60 min", minMinutes: 30 },
  { key: "60m+", label: "Over an hour", minMinutes: 60 },
] as const;

export interface DayCount {
  /** YYYY-MM-DD, the UTC day the count belongs to. */
  day: string;
  visits: number;
}

export interface ToolCount {
  key: string;
  name: string;
  sessions: number;
  /** Listening time, from the 5-minute heartbeat, so runs under 5 minutes add nothing. */
  hours: number;
}

export interface ItemCount extends ToolCount {
  /** The tool it belongs to. */
  detail: string;
}

export interface SplitPart {
  key: string;
  label: string;
  visits: number;
}

export interface StatsData {
  mode: "live" | "sample";
  /** When these numbers were fetched (ISO). */
  generatedAt: string;

  /** Totals since COUNTING_SINCE. Null where that call failed. */
  launch: { visits: number | null; sessions: number | null; hours: number | null };

  visits7d: number;
  visitsPrevious7d: number;
  visits28d: number;
  sessions28d: number;
  listeningHours28d: number;

  /** One entry per day, oldest first, WINDOW_DAYS long. */
  daily: DayCount[];
  /** 24 entries, midnight first, Sydney time. Visits active in each hour, added up over the window. */
  byHour: number[];
  /** 7 entries, Monday first, Sydney time. */
  byWeekday: number[];

  /** Every tool with any use, busiest first by sessions. */
  tools: ToolCount[];
  /** The most used sessions across all tools, by sessions or by hours (up to 8). */
  items: ItemCount[];
  /** Sessions ended in each length bucket, in LENGTH_BUCKETS order. Empty if unavailable. */
  sessionLengths: number[];

  /** Visits by kind of device, biggest first. */
  devices: SplitPart[];
  /** Visits by country, biggest first. */
  countries: SplitPart[];

  /** The Your Brain check, since launch. */
  quiz: { started: number | null; completed: number | null; averageScore: number | null; outOf: number | null };

  /** True when some of the calls failed and their sections are missing. */
  partial: boolean;
}

export type StatsResult =
  | { state: "off" }
  | { state: "error" }
  | { state: "ok"; data: StatsData };

// ── Talking to Vercel ────────────────────────────────────────────────────────

interface ApiConfig {
  base: string;
  token: string;
  project: string;
  team: string;
}

function config(): ApiConfig | null {
  const token = process.env.VERCEL_ANALYTICS_TOKEN?.trim();
  if (!token) return null;
  return {
    base: (process.env.VERCEL_ANALYTICS_API_URL?.trim() || "https://api.vercel.com").replace(/\/+$/, ""),
    token,
    project: process.env.VERCEL_ANALYTICS_PROJECT?.trim() || "binaural-audio-companion",
    team: process.env.VERCEL_ANALYTICS_TEAM?.trim() || "metabundle",
  };
}

type Row = Record<string, unknown>;

async function query(
  cfg: ApiConfig,
  path: string,
  params: Record<string, string | number | undefined>,
): Promise<unknown> {
  const search = new URLSearchParams();
  search.set("projectId", cfg.project);
  if (cfg.team.startsWith("team_")) search.set("teamId", cfg.team);
  else search.set("slug", cfg.team);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value));
  }

  const response = await fetch(`${cfg.base}${path}?${search.toString()}`, {
    headers: { Authorization: `Bearer ${cfg.token}` },
    next: { revalidate: STATS_REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) {
    // The status only. Never log the token.
    throw new Error(`analytics ${response.status}`);
  }
  const body: unknown = await response.json();
  if (typeof body !== "object" || body === null || !("data" in body)) {
    throw new Error("analytics: unexpected response");
  }
  return (body as { data: unknown }).data;
}

async function aggregate(
  cfg: ApiConfig,
  kind: "visits" | "events",
  by: string,
  since: number,
  until: number,
  filter?: string,
  limit = 100,
): Promise<Row[]> {
  const data = await query(cfg, `/v1/query/web-analytics/${kind}/aggregate`, { by, since, until, filter, limit });
  return Array.isArray(data) ? data.filter((row): row is Row => typeof row === "object" && row !== null) : [];
}

async function count(
  cfg: ApiConfig,
  kind: "visits" | "events",
  params: { since?: number; until?: number; filter?: string },
): Promise<Row> {
  const data = await query(cfg, `/v1/query/web-analytics/${kind}/count`, params);
  return typeof data === "object" && data !== null && !Array.isArray(data) ? (data as Row) : {};
}

function num(value: unknown): number {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function timeOf(row: Row): number | null {
  const t = row.timestamp;
  const ms = typeof t === "number" ? t : typeof t === "string" ? Date.parse(t) : NaN;
  return Number.isFinite(ms) ? ms : null;
}

/**
 * The group value of a row grouped by `key` (a visit dimension such as
 * "deviceType") or by `eventData/<key>`. The docs show event groups under
 * "eventData"; the other spellings are accepted in case that changes.
 */
function groupValue(row: Row, key: string): string | null {
  const candidates = [row[key], row[`eventData/${key}`], row.eventData];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate) return candidate;
    if (typeof candidate === "object" && candidate !== null) {
      const inner = (candidate as Row)[key];
      if (typeof inner === "string" && inner) return inner;
    }
  }
  return null;
}

const quote = (value: string) => `'${value.replace(/'/g, "''")}'`;

// ── Dates and Sydney time ────────────────────────────────────────────────────

const SYDNEY = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  hour: "numeric",
  hourCycle: "h23",
  weekday: "short",
});
const WEEKDAY_INDEX: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

function sydneyHourAndWeekday(ms: number): { hour: number; weekday: number } | null {
  let hour = -1;
  let weekday = -1;
  for (const part of SYDNEY.formatToParts(new Date(ms))) {
    if (part.type === "hour") hour = Number(part.value) % 24;
    if (part.type === "weekday") weekday = WEEKDAY_INDEX[part.value] ?? -1;
  }
  return hour >= 0 && weekday >= 0 ? { hour, weekday } : null;
}

const utcDayKey = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const startOfUtcDay = (ms: number) => Math.floor(ms / DAY_MS) * DAY_MS;

function prettyItem(tool: ToolKey, item: string): string {
  const known = ITEM_LABELS[item.toLowerCase()];
  if (known) return known;
  if (tool === "binaural") return item.slice(0, 60);
  return item
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .slice(0, 60);
}

const DEVICE_LABELS: Record<string, string> = {
  mobile: "Phone",
  smartphone: "Phone",
  phone: "Phone",
  desktop: "Computer",
  computer: "Computer",
  laptop: "Computer",
  tablet: "Tablet",
};

function countryName(code: string): string {
  try {
    const name = new Intl.DisplayNames(["en-AU"], { type: "region" }).of(code.toUpperCase());
    if (name && name !== code.toUpperCase()) return name;
  } catch {
    // Not a region code: fall through.
  }
  return code;
}

/** Keep the biggest `keep` parts and fold the rest into "Other", so a split never needs more than 3 colours. */
function foldParts(parts: SplitPart[], keep: number): SplitPart[] {
  const sorted = [...parts].sort((a, b) => b.visits - a.visits).filter((p) => p.visits > 0);
  if (sorted.length <= keep + 1) return sorted;
  const rest = sorted.slice(keep).reduce((total, p) => total + p.visits, 0);
  return [...sorted.slice(0, keep), { key: "other", label: "Other", visits: rest }];
}

/** Merge rows that map to the same label (e.g. "mobile" and "Mobile"). */
function mergeParts(rows: Row[], key: string, label: (raw: string) => string): SplitPart[] {
  const merged = new Map<string, SplitPart>();
  for (const row of rows) {
    const raw = groupValue(row, key);
    if (!raw || raw.toLowerCase() === "others") continue;
    const name = label(raw);
    const existing = merged.get(name);
    if (existing) existing.visits += num(row.visitors);
    else merged.set(name, { key: name.toLowerCase().replace(/\s+/g, "-"), label: name, visits: num(row.visitors) });
  }
  return [...merged.values()];
}

// ── The live numbers ─────────────────────────────────────────────────────────

async function liveStats(cfg: ApiConfig, now: number): Promise<StatsResult> {
  const today = startOfUtcDay(now);
  // Five weeks of days: four for the chart, one more for "the week before".
  const dailySince = today - (WINDOW_DAYS + 7 - 1) * DAY_MS;
  const windowSince = today - (WINDOW_DAYS - 1) * DAY_MS;
  const launch = Date.parse(`${COUNTING_SINCE}T00:00:00Z`);

  // Hours come back one bucket each, so they are fetched four days at a time
  // to stay inside the API's 100-row limit.
  const hourChunks: { since: number; until: number }[] = [];
  for (let start = windowSince; start <= now; start += 4 * DAY_MS) {
    hourChunks.push({ since: start, until: Math.min(now, start + 4 * DAY_MS - 1) });
  }

  const STARTS = "eventName eq 'tool_start'";
  const BEATS = "eventName eq 'tool_5min'";
  const forTool = (filter: string, tool: ToolKey) => `${filter} and eventData/tool eq ${quote(tool)}`;

  const settled = await Promise.allSettled([
    /* 0 */ aggregate(cfg, "visits", "day", dailySince, now),
    /* 1 */ Promise.all(hourChunks.map((c) => aggregate(cfg, "visits", "hour", c.since, c.until))),
    /* 2 */ count(cfg, "visits", {}),
    /* 3 */ count(cfg, "events", { filter: STARTS }),
    /* 4 */ count(cfg, "events", { filter: BEATS }),
    /* 5 */ aggregate(cfg, "events", "eventData/tool", windowSince, now, STARTS, 20),
    /* 6 */ aggregate(cfg, "events", "eventData/tool", windowSince, now, BEATS, 20),
    /* 7 */ aggregate(cfg, "events", "eventData/length", windowSince, now, "eventName eq 'tool_stop'", 20),
    /* 8 */ aggregate(cfg, "visits", "deviceType", windowSince, now, undefined, 10),
    /* 9 */ aggregate(cfg, "visits", "country", windowSince, now, undefined, 10),
    /* 10 */ count(cfg, "events", { filter: "eventName eq 'quiz_start'" }),
    /* 11 */ count(cfg, "events", { filter: "eventName eq 'quiz_complete'" }),
    /* 12 */ aggregate(cfg, "events", "eventData/score", launch, now, "eventName eq 'quiz_complete'", 50),
    /* 13 */ Promise.all(TOOL_KEYS.map((t) => aggregate(cfg, "events", "eventData/item", windowSince, now, forTool(STARTS, t), 10))),
    /* 14 */ Promise.all(TOOL_KEYS.map((t) => aggregate(cfg, "events", "eventData/item", windowSince, now, forTool(BEATS, t), 10))),
  ]);

  const [
    dailyRes, hourlyRes, launchVisitsRes, launchStartsRes, launchBeatsRes,
    toolStartsRes, toolBeatsRes, lengthsRes, devicesRes, countriesRes,
    quizStartRes, quizDoneRes, quizScoreRes, itemStartsRes, itemBeatsRes,
  ] = settled;

  // The daily numbers are the spine of the page. Without them, show the error state.
  if (dailyRes.status === "rejected") {
    console.error("[stats] daily visits failed:", (dailyRes.reason as Error)?.message ?? "unknown");
    return { state: "error" };
  }

  let partial = false;
  function ok<T>(label: string, result: PromiseSettledResult<T>): T | null {
    if (result.status === "fulfilled") return result.value;
    partial = true;
    console.error(`[stats] ${label} failed:`, (result.reason as Error)?.message ?? "unknown");
    return null;
  }

  // Days
  const perDay = new Map<string, number>();
  for (const row of dailyRes.value) {
    const t = timeOf(row);
    if (t !== null) perDay.set(utcDayKey(t), (perDay.get(utcDayKey(t)) ?? 0) + num(row.visitors));
  }
  const allDays: DayCount[] = [];
  for (let t = dailySince; t <= today; t += DAY_MS) {
    allDays.push({ day: utcDayKey(t), visits: perDay.get(utcDayKey(t)) ?? 0 });
  }
  const daily = allDays.slice(-WINDOW_DAYS);
  const sumDays = (list: DayCount[]) => list.reduce((total, d) => total + d.visits, 0);

  // Hours and weekdays, in Sydney time
  const byHour = new Array<number>(24).fill(0);
  const byWeekday = new Array<number>(7).fill(0);
  for (const row of ok("hourly visits", hourlyRes)?.flat() ?? []) {
    const t = timeOf(row);
    const visits = num(row.visitors);
    if (t === null || visits === 0) continue;
    const local = sydneyHourAndWeekday(t);
    if (!local) continue;
    byHour[local.hour] += visits;
    byWeekday[local.weekday] += visits;
  }

  // Tools
  const isTool = (value: string | null): value is ToolKey => value !== null && value in TOOL_LABELS;
  const byTool = (rows: Row[] | null) => {
    const totals = new Map<ToolKey, number>();
    for (const row of rows ?? []) {
      const tool = groupValue(row, "tool");
      if (isTool(tool)) totals.set(tool, (totals.get(tool) ?? 0) + num(row.count));
    }
    return totals;
  };
  const toolStarts = byTool(ok("tool starts", toolStartsRes));
  const toolBeats = byTool(ok("listening time", toolBeatsRes));
  const tools: ToolCount[] = TOOL_KEYS.map((tool) => ({
    key: tool,
    name: TOOL_LABELS[tool],
    sessions: toolStarts.get(tool) ?? 0,
    hours: ((toolBeats.get(tool) ?? 0) * 5) / 60,
  }))
    .filter((t) => t.sessions > 0 || t.hours > 0)
    .sort((a, b) => b.sessions - a.sessions || b.hours - a.hours);

  // Items: sessions and hours, per tool, merged
  const itemMap = new Map<string, ItemCount>();
  const addItems = (results: Row[][] | null, field: "sessions" | "hours") => {
    results?.forEach((rows, index) => {
      const tool = TOOL_KEYS[index];
      for (const row of rows) {
        const raw = groupValue(row, "item");
        const value = num(row.count);
        if (!raw || raw.toLowerCase() === "others" || value === 0) continue;
        const name = prettyItem(tool, raw);
        const key = `${tool}:${name}`;
        const item = itemMap.get(key) ?? { key, name, detail: TOOL_LABELS[tool], sessions: 0, hours: 0 };
        if (field === "sessions") item.sessions += value;
        else item.hours += (value * 5) / 60;
        itemMap.set(key, item);
      }
    });
  };
  addItems(ok("items by sessions", itemStartsRes), "sessions");
  addItems(ok("items by hours", itemBeatsRes), "hours");
  const allItems = [...itemMap.values()];
  const topBySessions = [...allItems].sort((a, b) => b.sessions - a.sessions).slice(0, 8);
  const topByHours = [...allItems].sort((a, b) => b.hours - a.hours).slice(0, 8);
  const items = [...new Map([...topBySessions, ...topByHours].map((i) => [i.key, i])).values()];

  // Session lengths
  const lengthRows = ok("session lengths", lengthsRes);
  const sessionLengths = lengthRows
    ? LENGTH_BUCKETS.map((bucket) =>
        lengthRows.filter((row) => groupValue(row, "length") === bucket.key).reduce((total, row) => total + num(row.count), 0),
      )
    : [];

  // Devices and countries
  const devicesRows = ok("devices", devicesRes);
  const devices = devicesRows
    ? foldParts(mergeParts(devicesRows, "deviceType", (raw) => DEVICE_LABELS[raw.toLowerCase()] ?? raw), 2)
    : [];
  const countryRows = ok("countries", countriesRes);
  const countries = countryRows ? foldParts(mergeParts(countryRows, "country", countryName), 2) : [];

  // Launch totals
  const launchVisits = ok("visits since launch", launchVisitsRes);
  const launchStarts = ok("sessions since launch", launchStartsRes);
  const launchBeats = ok("listening since launch", launchBeatsRes);

  // The Your Brain check
  const quizStarted = ok("quiz starts", quizStartRes);
  const quizDone = ok("quiz completions", quizDoneRes);
  const scores = ok("quiz scores", quizScoreRes);
  let averageScore: number | null = null;
  let outOf: number | null = null;
  if (scores) {
    let total = 0;
    let n = 0;
    for (const row of scores) {
      const m = /^(\d+)\s*\/\s*(\d+)$/.exec(groupValue(row, "score") ?? "");
      const times = num(row.count);
      if (!m || times === 0) continue;
      total += Number(m[1]) * times;
      n += times;
      outOf = Math.max(outOf ?? 0, Number(m[2]));
    }
    if (n > 0) averageScore = total / n;
  }

  return {
    state: "ok",
    data: {
      mode: "live",
      generatedAt: new Date(now).toISOString(),
      launch: {
        visits: launchVisits ? num(launchVisits.visitors) : null,
        sessions: launchStarts ? num(launchStarts.count) : null,
        hours: launchBeats ? (num(launchBeats.count) * 5) / 60 : null,
      },
      visits7d: sumDays(allDays.slice(-7)),
      visitsPrevious7d: sumDays(allDays.slice(-14, -7)),
      visits28d: sumDays(daily),
      sessions28d: tools.reduce((total, t) => total + t.sessions, 0),
      listeningHours28d: tools.reduce((total, t) => total + t.hours, 0),
      daily,
      byHour,
      byWeekday,
      tools,
      items,
      sessionLengths,
      devices,
      countries,
      quiz: {
        started: quizStarted ? num(quizStarted.count) : null,
        completed: quizDone ? num(quizDone.count) : null,
        averageScore,
        outOf,
      },
      partial,
    },
  };
}

// ── Sample numbers, for reviewing the design ─────────────────────────────────

/** A small seeded generator, so the sample looks the same on every load. */
function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function sampleStats(now: number): StatsData {
  const random = seeded(2026);
  const today = startOfUtcDay(now);
  const hourShape = [5, 4, 3, 2, 2, 2, 3, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 6, 7, 8, 10, 12, 11, 8];
  const weekdayShape = [1, 0.95, 0.95, 1, 0.9, 1.05, 1.15];

  const allDays: DayCount[] = [];
  for (let i = WINDOW_DAYS + 6; i >= 0; i--) {
    const t = today - i * DAY_MS;
    const growth = 8 + (WINDOW_DAYS + 6 - i) * 0.35;
    const weekday = sydneyHourAndWeekday(t + 12 * HOUR_MS)?.weekday ?? 0;
    allDays.push({ day: utcDayKey(t), visits: Math.round(growth * weekdayShape[weekday] + random() * 5) });
  }
  const daily = allDays.slice(-WINDOW_DAYS);
  const visits28d = daily.reduce((total, d) => total + d.visits, 0);
  const shapeTotal = hourShape.reduce((a, b) => a + b, 0);
  const byHour = hourShape.map((share) => Math.round(((visits28d * 1.6) / shapeTotal) * share * (0.9 + random() * 0.2)));
  const weekdayTotal = weekdayShape.reduce((a, b) => a + b, 0);
  const byWeekday = weekdayShape.map((share) => Math.round(((visits28d * 1.6) / weekdayTotal) * share));

  const tools: ToolCount[] = [
    { key: "noise", name: TOOL_LABELS.noise, sessions: 214, hours: 96.5 },
    { key: "binaural", name: TOOL_LABELS.binaural, sessions: 168, hours: 61.2 },
    { key: "box-breathing", name: TOOL_LABELS["box-breathing"], sessions: 97, hours: 4.8 },
    { key: "body-scan", name: TOOL_LABELS["body-scan"], sessions: 52, hours: 9.6 },
    { key: "coherence", name: TOOL_LABELS.coherence, sessions: 31, hours: 2.1 },
  ];
  const item = (tool: ToolKey, name: string, sessions: number, hours: number): ItemCount => ({
    key: `${tool}:${name}`,
    name,
    detail: TOOL_LABELS[tool],
    sessions,
    hours,
  });

  return {
    mode: "sample",
    generatedAt: new Date(now).toISOString(),
    launch: { visits: visits28d + 41, sessions: 603, hours: 181.4 },
    visits7d: allDays.slice(-7).reduce((total, d) => total + d.visits, 0),
    visitsPrevious7d: allDays.slice(-14, -7).reduce((total, d) => total + d.visits, 0),
    visits28d,
    sessions28d: tools.reduce((total, t) => total + t.sessions, 0),
    listeningHours28d: tools.reduce((total, t) => total + t.hours, 0),
    daily,
    byHour,
    byWeekday,
    tools,
    items: [
      item("noise", "Heavy Rain", 88, 52.3),
      item("binaural", "Sleep", 71, 38.0),
      item("noise", "Ocean Waves", 46, 21.7),
      item("box-breathing", "Les's voice", 44, 2.5),
      item("binaural", "Anxiety", 39, 12.4),
      item("noise", "Pure Tone", 21, 14.9),
      item("body-scan", "Ben", 30, 6.1),
    ],
    sessionLengths: [96, 141, 172, 88, 41, 24],
    devices: [
      { key: "phone", label: "Phone", visits: 402 },
      { key: "computer", label: "Computer", visits: 71 },
      { key: "tablet", label: "Tablet", visits: 22 },
    ],
    countries: [
      { key: "australia", label: "Australia", visits: 451 },
      { key: "new-zealand", label: "New Zealand", visits: 19 },
      { key: "other", label: "Other", visits: 25 },
    ],
    quiz: { started: 64, completed: 41, averageScore: 6.8, outOf: 9 },
    partial: false,
  };
}

// ── Entry point ──────────────────────────────────────────────────────────────

export async function getStats(): Promise<StatsResult> {
  const now = Date.now();
  const cfg = config();
  if (!cfg) {
    // Production stays honest: no token, no numbers. Previews show labelled samples.
    if (process.env.VERCEL_ENV === "production") return { state: "off" };
    return { state: "ok", data: sampleStats(now) };
  }
  try {
    return await liveStats(cfg, now);
  } catch (error) {
    console.error("[stats] failed:", (error as Error)?.message ?? "unknown");
    return { state: "error" };
  }
}
