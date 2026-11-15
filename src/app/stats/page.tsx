import type { Metadata } from "next";
import Link from "next/link";
import ColumnChart, { type Column } from "@/components/stats/ColumnChart";
import { siteName } from "@/config";
import { WINDOW_DAYS, getStats, type StatsData } from "@/lib/stats";

export const metadata: Metadata = {
  title: `CRUX in numbers | ${siteName}`,
  description: "How CRUX is going: anonymous counts of visits, the busiest times of day and the most used tools.",
};

// Rebuilt in the background at most once an hour; the analytics calls are cached as long.
export const revalidate = 3600;

const CARD = "card p-5 sm:p-7";
const SECTION_TITLE = "text-xl md:text-2xl font-semibold tracking-tight text-[var(--text-primary)]";
const LEAD = "mt-2 text-[16px] leading-relaxed text-[var(--text-secondary)]";

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const fmt = (n: number) => Math.round(n).toLocaleString("en-AU");

function bigNumber(n: number): string {
  if (n >= 10_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return fmt(n);
}

function hours(n: number): string {
  if (n > 0 && n < 10) return n.toFixed(1).replace(/\.0$/, "");
  return fmt(n);
}

/** 0 → "12 am", 13 → "1 pm". */
function clock(hour: number): string {
  const h = ((hour % 24) + 24) % 24;
  const twelve = h % 12 === 0 ? 12 : h % 12;
  return `${twelve} ${h < 12 ? "am" : "pm"}`;
}

/** A UTC day key as a short label: "Tue 10 Nov". */
function dayLabel(day: string, long = false): string {
  const date = new Date(`${day}T00:00:00Z`);
  return date.toLocaleDateString("en-AU", {
    timeZone: "UTC",
    weekday: long ? "long" : "short",
    day: "numeric",
    month: long ? "long" : "short",
  });
}

function weekNote(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? "None the week before" : "None the week before either";
  const change = Math.round(((current - previous) / previous) * 100);
  if (change === 0) return "Same as the week before";
  return change > 0 ? `Up ${change}% on the week before` : `Down ${Math.abs(change)}% on the week before`;
}

function updatedLine(iso: string): string {
  const when = new Date(iso).toLocaleString("en-AU", {
    timeZone: "Australia/Sydney",
    hour: "numeric",
    minute: "2-digit",
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  return `Updated ${when}, Sydney time. The numbers refresh every hour.`;
}

// ── Small pieces ─────────────────────────────────────────────────────────────

function Tile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="card flex flex-col px-3.5 py-4 sm:px-5">
      <dt className="text-[14px] font-semibold leading-snug text-[var(--text-secondary)]">{label}</dt>
      <dd className="mt-1 text-[30px] font-semibold leading-tight tracking-tight text-[var(--text-primary)] sm:text-[34px]">{value}</dd>
      {note && <dd className="mt-1 text-[13px] leading-snug text-[var(--text-secondary)]">{note}</dd>}
    </div>
  );
}

interface BarRow {
  key: string;
  name: string;
  detail?: string;
  value: number;
  figure: string;
}

/** Ranked horizontal bars: name and figure on one line, the bar underneath. One colour. */
function RankedBars({ rows, label }: { rows: BarRow[]; label: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ol className="mt-5 flex flex-col gap-4" aria-label={label}>
      {rows.map((row) => (
        <li key={row.key}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
            <span className="text-[16px] font-semibold leading-snug text-[var(--text-primary)]">
              {row.name}
              {row.detail && (
                <span className="ml-2 text-[14px] font-normal text-[var(--text-secondary)]">{row.detail}</span>
              )}
            </span>
            <span className="text-[14px] text-[var(--text-secondary)]" style={{ fontVariantNumeric: "tabular-nums" }}>
              {row.figure}
            </span>
          </div>
          <div className="mt-2 h-3 w-full" aria-hidden="true">
            <div
              className="h-3 rounded-r bg-[var(--accent-2)]"
              style={{ width: `${Math.max(1.5, (row.value / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}

function Message({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={`${CARD} mt-10 text-center`}>
      <h2 className={SECTION_TITLE}>{title}</h2>
      <p className={LEAD}>{children}</p>
    </div>
  );
}

// ── The page ─────────────────────────────────────────────────────────────────

function Numbers({ data }: { data: StatsData }) {
  const hasVisits = data.visits28d > 0;

  // Visits per day
  const dailyColumns: Column[] = data.daily.map((d, i) => ({
    key: d.day,
    label: dayLabel(d.day),
    tick: i % 7 === 0 || i === data.daily.length - 1 ? dayLabel(d.day).replace(/^\S+\s/, "") : undefined,
    value: d.visits,
  }));
  const busiestDay = data.daily.reduce((best, d) => (d.visits > best.visits ? d : best), data.daily[0]);

  // Time of day
  const hourColumns: Column[] = data.byHour.map((value, hour) => ({
    key: `h${hour}`,
    label: `${clock(hour)} to ${clock(hour + 1)}`,
    tick: hour % 6 === 0 ? clock(hour) : undefined,
    value,
  }));
  const hourTotal = data.byHour.reduce((a, b) => a + b, 0);
  const busiestHour = data.byHour.indexOf(Math.max(...data.byHour));
  const nightShare = hourTotal > 0
    ? Math.round(([21, 22, 23, 0, 1, 2, 3, 4, 5].reduce((sum, h) => sum + data.byHour[h], 0) / hourTotal) * 100)
    : 0;

  // Day of the week
  const weekdayColumns: Column[] = data.byWeekday.map((value, i) => ({
    key: WEEKDAYS[i],
    label: WEEKDAYS[i],
    tick: WEEKDAYS[i].slice(0, 3),
    value,
  }));
  const weekdayTotal = data.byWeekday.reduce((a, b) => a + b, 0);
  const busiestWeekday = WEEKDAYS[data.byWeekday.indexOf(Math.max(...data.byWeekday))];

  return (
    <>
      {data.mode === "sample" && (
        <p role="note" className="mt-8 rounded-2xl border border-[var(--primary)] p-4 text-[15px] leading-relaxed text-[var(--text-primary)]">
          <strong>Sample numbers.</strong> This copy of CRUX is not connected to the real analytics, so
          every number below is made up to show the design.
        </p>
      )}

      {/* Headline numbers */}
      <dl className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile label="Visits this week" value={bigNumber(data.visits7d)} note={weekNote(data.visits7d, data.visitsPrevious7d)} />
        <Tile
          label="Visits in the last 4 weeks"
          value={bigNumber(data.visits28d)}
          note={data.visitsSinceStart !== null ? `${fmt(data.visitsSinceStart)} since counting began` : undefined}
        />
        <Tile label="Sessions started" value={bigNumber(data.sessions28d)} note="Across every tool, last 4 weeks" />
        <Tile label="Hours of listening" value={hours(data.listeningHours28d)} note="Last 4 weeks, counted in 5-minute steps" />
      </dl>

      {data.partial && (
        <p className="mt-4 text-[14px] text-[var(--text-secondary)]">
          Some of the numbers couldn&apos;t be loaded this time. They will be back at the next refresh.
        </p>
      )}

      {!hasVisits ? (
        <Message title="No visits counted yet">Nothing has been counted in the last four weeks.</Message>
      ) : (
        <div className="mt-8 flex flex-col gap-6">
          <section className={CARD} aria-labelledby="stats-daily">
            <h2 id="stats-daily" className={SECTION_TITLE}>Visits per day</h2>
            <p className={LEAD}>
              {fmt(data.visits28d)} visits in the last four weeks. The busiest day was{" "}
              <strong className="text-[var(--text-primary)]">{dayLabel(busiestDay.day, true)}</strong>, with{" "}
              {fmt(busiestDay.visits)}.
            </p>
            <div className="mt-6">
              <ColumnChart
                title="Visits per day, last four weeks"
                summary={`Busiest day ${dayLabel(busiestDay.day, true)}, with ${fmt(busiestDay.visits)} visits.`}
                columns={dailyColumns}
                unit={["visit", "visits"]}
                labelHeading="Day"
              />
            </div>
          </section>

          {hourTotal > 0 && (
            <section className={CARD} aria-labelledby="stats-hours">
              <h2 id="stats-hours" className={SECTION_TITLE}>What time people use CRUX</h2>
              <p className={LEAD}>
                The busiest hour is{" "}
                <strong className="text-[var(--text-primary)]">
                  {clock(busiestHour)} to {clock(busiestHour + 1)}
                </strong>
                , Sydney time. {nightShare}% of visits are between 9 pm and 6 am.
              </p>
              <div className="mt-6">
                <ColumnChart
                  title="Visits by hour of the day, Sydney time, last four weeks"
                  summary={`Busiest hour ${clock(busiestHour)} to ${clock(busiestHour + 1)}.`}
                  columns={hourColumns}
                  unit={["visit", "visits"]}
                  labelHeading="Hour, Sydney time"
                />
              </div>
            </section>
          )}

          {weekdayTotal > 0 && (
            <section className={CARD} aria-labelledby="stats-weekdays">
              <h2 id="stats-weekdays" className={SECTION_TITLE}>Busiest days of the week</h2>
              <p className={LEAD}>
                <strong className="text-[var(--text-primary)]">{busiestWeekday}</strong> is the busiest day,
                over the last four weeks.
              </p>
              <div className="mt-6">
                <ColumnChart
                  title="Visits by day of the week, last four weeks"
                  summary={`Busiest day of the week ${busiestWeekday}.`}
                  columns={weekdayColumns}
                  unit={["visit", "visits"]}
                  labelHeading="Day of the week"
                />
              </div>
            </section>
          )}

          {data.tools.length > 0 && (
            <section className={CARD} aria-labelledby="stats-tools">
              <h2 id="stats-tools" className={SECTION_TITLE}>Most used tools</h2>
              <p className={LEAD}>Sessions started in the last four weeks, and the hours spent listening.</p>
              <RankedBars
                label="Tools by sessions started"
                rows={data.tools.map((t) => ({
                  key: t.tool,
                  name: t.label,
                  value: t.sessions,
                  figure: `${fmt(t.sessions)} ${t.sessions === 1 ? "session" : "sessions"} · ${hours(t.hours)} ${t.hours === 1 ? "hour" : "hours"}`,
                }))}
              />
            </section>
          )}

          {data.topItems.length > 0 && (
            <section className={CARD} aria-labelledby="stats-items">
              <h2 id="stats-items" className={SECTION_TITLE}>Most played</h2>
              <p className={LEAD}>The sessions started most often in the last four weeks.</p>
              <RankedBars
                label="Most played sessions"
                rows={data.topItems.map((item) => ({
                  key: `${item.tool}-${item.item}`,
                  name: item.item,
                  detail: item.toolLabel,
                  value: item.sessions,
                  figure: `${fmt(item.sessions)} ${item.sessions === 1 ? "session" : "sessions"}`,
                }))}
              />
            </section>
          )}
        </div>
      )}

      <section className={`${CARD} mt-6`} aria-labelledby="stats-about">
        <h2 id="stats-about" className={SECTION_TITLE}>About these numbers</h2>
        <ul className="mt-4 flex list-disc flex-col gap-2 pl-5 text-[15px] leading-relaxed text-[var(--text-secondary)]">
          <li>They are anonymous. There are no accounts, no cookies and nothing that identifies anyone.</li>
          <li>
            A visit is one person on one day. Vercel, the service that hosts CRUX, counts people with an
            anonymous code that resets every day, so the same person on two days counts as two visits.
          </li>
          <li>Times of day are Sydney time. Daily totals run midnight to midnight UTC, which is mid-morning in Sydney.</li>
          <li>Listening time is counted in 5-minute steps, so very short sessions add nothing to it.</li>
          <li>{updatedLine(data.generatedAt)}</li>
        </ul>
      </section>
    </>
  );
}

export default async function StatsPage() {
  const result = await getStats();

  return (
    <main className="min-h-screen px-4 pb-16 pt-10 sm:px-5 md:pt-14">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <span className="eyebrow">CRUX in numbers</span>
          <h1 className="mt-5 text-balance text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl md:text-5xl">
            How CRUX is going
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-[17px] leading-relaxed text-[var(--text-secondary)]">
            How many people use CRUX, when they use it, and which tools they reach for. Anonymous counts
            from the last {WINDOW_DAYS / 7} weeks.
          </p>
        </div>

        {result.state === "off" && (
          <Message title="Not switched on yet">
            The numbers will appear here once CRUX is connected to its analytics.
          </Message>
        )}
        {result.state === "error" && (
          <Message title="Couldn't load the numbers">
            Something went wrong fetching them. They will be back at the next refresh, within the hour.
          </Message>
        )}
        {result.state === "ok" && <Numbers data={result.data} />}

        <p className="mt-10 text-center">
          <Link href="/about" className="btn-ghost min-h-11">
            Back to About
          </Link>
        </p>
      </div>
    </main>
  );
}
