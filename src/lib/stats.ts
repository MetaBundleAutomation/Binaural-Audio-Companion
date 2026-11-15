/**
 * The numbers behind the "CRUX in numbers" page (/stats).
 *
 * They come from Vercel Web Analytics, read on the server through Vercel's
 * Web Analytics query API (https://vercel.com/docs/analytics/web-analytics-api).
 * The browser never talks to Vercel and never sees the token. Responses are
 * cached for an hour, so the page costs a handful of API calls an hour however
 * many people open it.
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

/** How many days the charts cover. Four whole weeks, so every weekday counts equally. */
export const WINDOW_DAYS = 28;

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

export interface DayCount {
  /** YYYY-MM-DD, the UTC day the count belongs to. */
  day: string;
  visits: number;
}

export interface ToolCount {
  tool: ToolKey;
  label: string;
  sessions: number;
  /** Listening time, from the 5-minute heartbeat, so runs under 5 minutes add nothing. */
  hours: number;
}

export interface ItemCount {
  tool: ToolKey;
  toolLabel: string;
  item: string;
  sessions: number;
}

export interface StatsData {
  mode: "live" | "sample";
  /** When these numbers were fetched (ISO). */
  generatedAt: string;
  visits7d: number;
  visitsPrevious7d: number;
  visits28d: number;
  /** Visits since Vercel started counting, or null if that call failed. */
  visitsSinceStart: number | null;
  sessions28d: number;
  listeningHours28d: number;
  /** One entry per day, oldest first, WINDOW_DAYS long. */
  daily: DayCount[];
  /** 24 entries, midnight first, Sydney time. Visits active in each hour, added up over the window. */
  byHour: number[];
  /** 7 entries, Monday first, Sydney time. */
  byWeekday: number[];
  /** Ranked by sessions started, busiest first. */
  tools: ToolCount[];
  /** The five most started sessions across all tools. */
  topItems: ItemCount[];
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
    // The status only. Never log the token or the address, which carries no secret but is noise.
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
  const data = await query(cfg, `/v1/query/web-analytics/${kind}/aggregate`, {
    by,
    since,
    until,
    filter,
    limit,
  });
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
 * The group value of an event row grouped by `eventData/<key>`. The docs show
 * it under "eventData"; the other spellings are accepted in case that changes.
 */
function groupValue(row: Row, key: string): string | null {
  const candidates = [row[`eventData/${key}`], row.eventData, row[key]];
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

// ── The live numbers ─────────────────────────────────────────────────────────

async function liveStats(cfg: ApiConfig, now: number): Promise<StatsResult> {
  const today = startOfUtcDay(now);
  // Five weeks of days: four for the chart, one more for "the week before".
  const dailySince = today - (WINDOW_DAYS + 7 - 1) * DAY_MS;
  const windowSince = today - (WINDOW_DAYS - 1) * DAY_MS;

  // Hours come back one bucket each, so they are fetched four days at a time
  // to stay inside the API's 100-row limit.
  const hourChunks: { since: number; until: number }[] = [];
  for (let start = windowSince; start <= now; start += 4 * DAY_MS) {
    hourChunks.push({ since: start, until: Math.min(now, start + 4 * DAY_MS - 1) });
  }

  const startFilter = "eventName eq 'tool_start'";

  const [dailyRes, hourlyRes, sinceStartRes, toolStartsRes, heartbeatsRes, ...itemRes] = await Promise.allSettled([
    aggregate(cfg, "visits", "day", dailySince, now),
    Promise.all(hourChunks.map((c) => aggregate(cfg, "visits", "hour", c.since, c.until))),
    count(cfg, "visits", {}),
    aggregate(cfg, "events", "eventData/tool", windowSince, now, startFilter, 20),
    aggregate(cfg, "events", "eventData/tool", windowSince, now, "eventName eq 'tool_5min'", 20),
    ...TOOL_KEYS.map((tool) =>
      aggregate(cfg, "events", "eventData/item", windowSince, now, `${startFilter} and eventData/tool eq ${quote(tool)}`, 5),
    ),
  ]);

  // The daily numbers are the spine of the page. Without them, show the error state.
  if (dailyRes.status === "rejected") {
    console.error("[stats] daily visits failed:", (dailyRes.reason as Error)?.message ?? "unknown");
    return { state: "error" };
  }

  let partial = false;
  const failed = (label: string, result: PromiseSettledResult<unknown>) => {
    if (result.status === "rejected") {
      partial = true;
      console.error(`[stats] ${label} failed:`, (result.reason as Error)?.message ?? "unknown");
      return true;
    }
    return false;
  };

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
  const sum = (list: DayCount[]) => list.reduce((total, d) => total + d.visits, 0);

  // Hours and weekdays, in Sydney time
  const byHour = new Array<number>(24).fill(0);
  const byWeekday = new Array<number>(7).fill(0);
  if (!failed("hourly visits", hourlyRes) && hourlyRes.status === "fulfilled") {
    for (const row of hourlyRes.value.flat()) {
      const t = timeOf(row);
      const visits = num(row.visitors);
      if (t === null || visits === 0) continue;
      const local = sydneyHourAndWeekday(t);
      if (!local) continue;
      byHour[local.hour] += visits;
      byWeekday[local.weekday] += visits;
    }
  }

  // Tools
  const sessionsByTool = new Map<ToolKey, number>();
  const heartbeatsByTool = new Map<ToolKey, number>();
  const isTool = (value: string | null): value is ToolKey => value !== null && value in TOOL_LABELS;
  if (!failed("tool starts", toolStartsRes) && toolStartsRes.status === "fulfilled") {
    for (const row of toolStartsRes.value) {
      const tool = groupValue(row, "tool");
      if (isTool(tool)) sessionsByTool.set(tool, (sessionsByTool.get(tool) ?? 0) + num(row.count));
    }
  }
  if (!failed("listening time", heartbeatsRes) && heartbeatsRes.status === "fulfilled") {
    for (const row of heartbeatsRes.value) {
      const tool = groupValue(row, "tool");
      if (isTool(tool)) heartbeatsByTool.set(tool, (heartbeatsByTool.get(tool) ?? 0) + num(row.count));
    }
  }
  const tools: ToolCount[] = TOOL_KEYS.map((tool) => ({
    tool,
    label: TOOL_LABELS[tool],
    sessions: sessionsByTool.get(tool) ?? 0,
    hours: ((heartbeatsByTool.get(tool) ?? 0) * 5) / 60,
  }))
    .filter((t) => t.sessions > 0 || t.hours > 0)
    .sort((a, b) => b.sessions - a.sessions || b.hours - a.hours);

  // Most started sessions across all tools
  const items: ItemCount[] = [];
  itemRes.forEach((result, index) => {
    const tool = TOOL_KEYS[index];
    if (failed(`items for ${tool}`, result) || result.status !== "fulfilled") return;
    for (const row of result.value) {
      const item = groupValue(row, "item");
      const sessions = num(row.count);
      if (!item || item.toLowerCase() === "others" || sessions === 0) continue;
      items.push({ tool, toolLabel: TOOL_LABELS[tool], item: prettyItem(tool, item), sessions });
    }
  });
  items.sort((a, b) => b.sessions - a.sessions);

  let visitsSinceStart: number | null = null;
  if (!failed("visits since start", sinceStartRes) && sinceStartRes.status === "fulfilled") {
    visitsSinceStart = num(sinceStartRes.value.visitors);
  }

  return {
    state: "ok",
    data: {
      mode: "live",
      generatedAt: new Date(now).toISOString(),
      visits7d: sum(allDays.slice(-7)),
      visitsPrevious7d: sum(allDays.slice(-14, -7)),
      visits28d: sum(daily),
      visitsSinceStart,
      sessions28d: tools.reduce((total, t) => total + t.sessions, 0),
      listeningHours28d: tools.reduce((total, t) => total + t.hours, 0),
      daily,
      byHour,
      byWeekday,
      tools,
      topItems: items.slice(0, 5),
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
  // Evenings and late nights busiest, as you might expect for a sleep and calm app.
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
    { tool: "noise" as ToolKey, sessions: 214, hours: 96.5 },
    { tool: "binaural" as ToolKey, sessions: 168, hours: 61.2 },
    { tool: "box-breathing" as ToolKey, sessions: 97, hours: 4.8 },
    { tool: "body-scan" as ToolKey, sessions: 52, hours: 9.6 },
    { tool: "coherence" as ToolKey, sessions: 31, hours: 2.1 },
  ].map((t) => ({ ...t, label: TOOL_LABELS[t.tool] }));

  return {
    mode: "sample",
    generatedAt: new Date(now).toISOString(),
    visits7d: allDays.slice(-7).reduce((total, d) => total + d.visits, 0),
    visitsPrevious7d: allDays.slice(-14, -7).reduce((total, d) => total + d.visits, 0),
    visits28d,
    visitsSinceStart: visits28d + 41,
    sessions28d: tools.reduce((total, t) => total + t.sessions, 0),
    listeningHours28d: tools.reduce((total, t) => total + t.hours, 0),
    daily,
    byHour,
    byWeekday,
    tools,
    topItems: [
      { tool: "noise", toolLabel: TOOL_LABELS.noise, item: "Heavy Rain", sessions: 88 },
      { tool: "binaural", toolLabel: TOOL_LABELS.binaural, item: "Sleep", sessions: 71 },
      { tool: "noise", toolLabel: TOOL_LABELS.noise, item: "Ocean Waves", sessions: 46 },
      { tool: "box-breathing", toolLabel: TOOL_LABELS["box-breathing"], item: "Les's voice", sessions: 44 },
      { tool: "binaural", toolLabel: TOOL_LABELS.binaural, item: "Anxiety", sessions: 39 },
    ],
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
