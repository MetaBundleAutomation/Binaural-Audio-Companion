import type { Metadata } from "next";
import Link from "next/link";
import ColumnChart, { type Column } from "@/components/stats/ColumnChart";
import MetricBars from "@/components/stats/MetricBars";
import SplitBar from "@/components/stats/SplitBar";
import { CopyFindings, PrintButton } from "@/components/stats/StatsActions";
import { siteName } from "@/config";
import { COUNTING_SINCE, LENGTH_BUCKETS, WINDOW_DAYS, getStats, type StatsData } from "@/lib/stats";

export const metadata: Metadata = {
  title: `CRUX in numbers | ${siteName}`,
  description:
    "How CRUX is going: visits, sessions and hours of listening since launch, the busiest times, the most used tools, and who uses it.",
};

// Rebuilt in the background at most once an hour; the analytics calls are cached as long.
export const revalidate = 3600;

const CARD = "card p-5 sm:p-7 break-inside-avoid";
const CARD_TITLE = "text-[20px] font-semibold leading-snug tracking-tight text-[var(--text-primary)]";
const LEAD = "mt-1.5 text-[15px] leading-relaxed text-[var(--text-secondary)]";

// Short axis labels for the session-length chart; the heading says they are minutes.
const LENGTH_TICKS = ["<1", "1–5", "5–15", "15–30", "30–60", "60+"];

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_MS = 86_400_000;

// ── Formatting ───────────────────────────────────────────────────────────────

const fmt = (n: number) => Math.round(n).toLocaleString("en-AU");

function big(n: number): string {
  if (n >= 10_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return fmt(n);
}

function hoursValue(n: number): string {
  if (n > 0 && n < 10) return n.toFixed(1).replace(/\.0$/, "");
  return fmt(n);
}

const hoursWords = (n: number) => `${hoursValue(n)} ${hoursValue(n) === "1" ? "hour" : "hours"}`;
const plural = (n: number, one: string, many: string) => `${fmt(n)} ${Math.round(n) === 1 ? one : many}`;
const percent = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

/** 0 → "12 am", 13 → "1 pm". */
function clock(hour: number): string {
  const h = ((hour % 24) + 24) % 24;
  const twelve = h % 12 === 0 ? 12 : h % 12;
  return `${twelve} ${h < 12 ? "am" : "pm"}`;
}

/** A UTC day key as a label: "Tue 10 Nov", or "Tuesday 10 November". */
function dayLabel(day: string, long = false): string {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString("en-AU", {
    timeZone: "UTC",
    weekday: long ? "long" : "short",
    day: "numeric",
    month: long ? "long" : "short",
  });
}

const launchDate = new Date(`${COUNTING_SINCE}T00:00:00Z`).toLocaleDateString("en-AU", {
  timeZone: "UTC",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function weekNote(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? "None the week before" : "None the week before either";
  const change = Math.round(((current - previous) / previous) * 100);
  if (change === 0) return "Same as the week before";
  return change > 0 ? `Up ${change}% on the week before` : `Down ${Math.abs(change)}% on the week before`;
}

function updatedAt(iso: string): string {
  return new Date(iso).toLocaleString("en-AU", {
    timeZone: "Australia/Sydney",
    hour: "numeric",
    minute: "2-digit",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── Plain-language findings, for proposals ───────────────────────────────────

function findings(data: StatsData): string[] {
  const out: string[] = [];
  const { launch } = data;
  if (launch.visits !== null && launch.sessions !== null && launch.hours !== null) {
    out.push(
      `Since ${launchDate}, CRUX has had ${plural(launch.visits, "visit", "visits")}, ${plural(launch.sessions, "session", "sessions")} and ${hoursWords(launch.hours)} of listening.`,
    );
  }
  if (data.visitsPrevious7d > 0) {
    const change = Math.round(((data.visits7d - data.visitsPrevious7d) / data.visitsPrevious7d) * 100);
    out.push(
      change === 0
        ? `Visits this week held steady at ${fmt(data.visits7d)}.`
        : `Visits this week are ${change > 0 ? "up" : "down"} ${Math.abs(change)}% on the week before (${fmt(data.visits7d)} against ${fmt(data.visitsPrevious7d)}).`,
    );
  }
  const topTool = data.tools[0];
  if (topTool) {
    out.push(
      `${topTool.name} is the most used tool: ${plural(topTool.sessions, "session", "sessions")} and ${hoursWords(topTool.hours)} of listening in the last four weeks.`,
    );
  }
  const topListened = [...data.items].sort((a, b) => b.hours - a.hours)[0];
  if (topListened && topListened.hours > 0) {
    out.push(`The most listened-to session is ${topListened.name} (${topListened.detail}), with ${hoursWords(topListened.hours)}.`);
  }
  const lengthTotal = data.sessionLengths.reduce((a, b) => a + b, 0);
  if (lengthTotal > 0) {
    const fivePlus = data.sessionLengths.slice(2).reduce((a, b) => a + b, 0);
    out.push(`${percent(fivePlus, lengthTotal)}% of sessions lasted 5 minutes or more.`);
  }
  const deviceTotal = data.devices.reduce((sum, d) => sum + d.visits, 0);
  const phone = data.devices.find((d) => d.label === "Phone");
  if (phone && deviceTotal > 0) out.push(`${percent(phone.visits, deviceTotal)}% of visits are on a phone.`);
  const countryTotal = data.countries.reduce((sum, c) => sum + c.visits, 0);
  const australia = data.countries.find((c) => c.label === "Australia");
  if (australia && countryTotal > 0) out.push(`${percent(australia.visits, countryTotal)}% of visits come from Australia.`);
  const hourTotal = data.byHour.reduce((a, b) => a + b, 0);
  if (hourTotal > 0) {
    const night = [21, 22, 23, 0, 1, 2, 3, 4, 5].reduce((sum, h) => sum + data.byHour[h], 0);
    out.push(`${percent(night, hourTotal)}% of visits happen between 9 pm and 6 am, Sydney time.`);
  }
  if (data.quiz.completed && data.quiz.completed > 0) {
    const score =
      data.quiz.averageScore !== null && data.quiz.outOf
        ? `, with an average score of ${data.quiz.averageScore.toFixed(1).replace(/\.0$/, "")} out of ${data.quiz.outOf}`
        : "";
    out.push(`The Your Brain check has been completed ${plural(data.quiz.completed, "time", "times")}${score}.`);
  }
  return out;
}

// ── Small pieces ─────────────────────────────────────────────────────────────

function Group({ id, title, blurb, children }: { id: string; title: string; blurb: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-12">
      <h2 id={id} className="text-[26px] font-bold leading-none text-[var(--text-primary)] md:text-[30px]">
        {title}
      </h2>
      <p className="mt-2 text-[16px] leading-relaxed text-[var(--text-secondary)]">{blurb}</p>
      <div className="mt-5 flex flex-col gap-5">{children}</div>
    </section>
  );
}

function Tile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="card flex flex-col px-3.5 py-4 sm:px-5 break-inside-avoid">
      <dt className="text-[14px] font-semibold leading-snug text-[var(--text-secondary)]">{label}</dt>
      <dd className="mt-1 text-[30px] font-semibold leading-tight tracking-tight text-[var(--text-primary)] sm:text-[34px]">
        {value}
      </dd>
      {note && <dd className="mt-1 text-[13px] leading-snug text-[var(--text-secondary)]">{note}</dd>}
    </div>
  );
}

function Message({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={`${CARD} mt-10 text-center`}>
      <h2 className="text-xl font-semibold text-[var(--text-primary)] md:text-2xl">{title}</h2>
      <p className={LEAD}>{children}</p>
    </div>
  );
}

// ── The numbers ──────────────────────────────────────────────────────────────

function Numbers({ data }: { data: StatsData }) {
  const lines = findings(data);
  const hasVisits = data.visits28d > 0;

  // Days counted inside the window, so the average isn't diluted by days before counting began.
  const firstWindowDay = Date.parse(`${data.daily[0]?.day ?? COUNTING_SINCE}T00:00:00Z`);
  const countingStart = Math.max(firstWindowDay, Date.parse(`${COUNTING_SINCE}T00:00:00Z`));
  const lastDay = Date.parse(`${data.daily[data.daily.length - 1]?.day ?? COUNTING_SINCE}T00:00:00Z`);
  const daysCounted = Math.max(1, Math.round((lastDay - countingStart) / DAY_MS) + 1);
  const visitsCounted = data.daily
    .filter((d) => d.day >= COUNTING_SINCE)
    .reduce((total, d) => total + d.visits, 0);
  const averagePerDay = visitsCounted / daysCounted;

  const dailyColumns: Column[] = data.daily.map((d, i) => ({
    key: d.day,
    label: dayLabel(d.day),
    tick: i % 7 === 0 || i === data.daily.length - 1 ? dayLabel(d.day).replace(/^\S+\s/, "") : undefined,
    value: d.visits,
  }));
  const busiestDay = data.daily.reduce((best, d) => (d.visits > best.visits ? d : best), data.daily[0]);

  const hourColumns: Column[] = data.byHour.map((value, hour) => ({
    key: `h${hour}`,
    label: `${clock(hour)} to ${clock(hour + 1)}`,
    tick: hour % 6 === 0 ? clock(hour) : undefined,
    value,
  }));
  const hourTotal = data.byHour.reduce((a, b) => a + b, 0);
  const busiestHour = data.byHour.indexOf(Math.max(...data.byHour));

  const weekdayColumns: Column[] = data.byWeekday.map((value, i) => ({
    key: WEEKDAYS[i],
    label: WEEKDAYS[i],
    tick: WEEKDAYS[i].slice(0, 3),
    value,
  }));
  const weekdayTotal = data.byWeekday.reduce((a, b) => a + b, 0);
  const busiestWeekday = WEEKDAYS[data.byWeekday.indexOf(Math.max(...data.byWeekday))];

  const lengthTotal = data.sessionLengths.reduce((a, b) => a + b, 0);
  const lengthColumns: Column[] = LENGTH_BUCKETS.map((bucket, i) => ({
    key: bucket.key,
    label: bucket.label,
    tick: LENGTH_TICKS[i],
    value: data.sessionLengths[i] ?? 0,
  }));
  const fivePlus = data.sessionLengths.slice(2).reduce((a, b) => a + b, 0);
  const sessionsPerVisit = data.visits28d > 0 ? data.sessions28d / data.visits28d : 0;

  const quizRate =
    data.quiz.started && data.quiz.completed !== null ? percent(data.quiz.completed, data.quiz.started) : null;

  return (
    <>
      {data.mode === "sample" && (
        <p role="note" className="mt-8 rounded-2xl border border-[var(--primary)] p-4 text-[15px] leading-relaxed text-[var(--text-primary)]">
          <strong>Sample numbers.</strong> This copy of CRUX is not connected to the real analytics, so every number
          below is made up to show the design.
        </p>
      )}
      {data.partial && (
        <p className="mt-6 text-[14px] text-[var(--text-secondary)]">
          Some of the numbers couldn&apos;t be loaded this time. They will be back at the next refresh.
        </p>
      )}

      {/* Since launch: the headline */}
      <section
        aria-labelledby="stats-launch"
        className="card glow mt-8 overflow-hidden p-6 sm:p-9 break-inside-avoid"
        style={{
          background:
            "radial-gradient(120% 140% at 0% 0%, color-mix(in srgb, var(--accent-2) 14%, transparent), transparent 60%), linear-gradient(180deg, var(--background-card), var(--background-light))",
        }}
      >
        <p className="eyebrow">Since {launchDate}</p>
        <h2 id="stats-launch" className="mt-4 text-[26px] font-bold leading-tight text-[var(--text-primary)] md:text-[32px]">
          CRUX so far
        </h2>
        <dl className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { label: "Visits", value: data.launch.visits, words: "A visit is one person on one day" },
            { label: "Sessions started", value: data.launch.sessions, words: "Across all five tools" },
            { label: "Hours of listening", value: data.launch.hours, words: "Counted in 5-minute steps" },
          ].map(({ label, value, words }) => (
            // On a phone: label and note on the left, the number on the right. From sm up: stacked.
            <div key={label} className="grid grid-cols-[1fr_auto] items-center gap-x-4 sm:flex sm:flex-col sm:items-start">
              <dt className="col-start-1 row-start-1 text-[15px] font-semibold text-[var(--text-secondary)]">{label}</dt>
              <dd className="col-start-2 row-span-2 row-start-1 text-[44px] font-semibold leading-none tracking-tight text-[var(--text-primary)] sm:mt-1 sm:text-[52px] md:text-[60px]">
                {value === null ? "–" : label.startsWith("Hours") ? hoursValue(value) : big(value)}
              </dd>
              <dd className="col-start-1 row-start-2 mt-1 text-[14px] text-[var(--text-secondary)] sm:mt-2">
                {value === null ? "Couldn't load this one" : words}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Key findings */}
      {lines.length > 0 && (
        <section aria-labelledby="stats-findings" className={`${CARD} mt-5`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="stats-findings" className="text-[22px] font-bold leading-none text-[var(--text-primary)]">
              Key findings
            </h2>
            <CopyFindings text={[`CRUX in numbers, ${updatedAt(data.generatedAt)} (Sydney time)`, ...lines.map((l) => `- ${l}`)].join("\n")} />
          </div>
          <ul className="mt-5 flex flex-col gap-3">
            {lines.map((line) => (
              <li key={line} className="flex gap-3 text-[16px] leading-relaxed text-[var(--text-primary)]">
                <span aria-hidden="true" className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-[var(--accent-2)]" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasVisits ? (
        <Message title="No visits counted yet">Nothing has been counted in the last four weeks.</Message>
      ) : (
        <>
          <Group id="stats-reach" title="Reach" blurb="How many people are using CRUX, over the last four weeks.">
            <dl className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              <Tile label="Visits this week" value={big(data.visits7d)} note={weekNote(data.visits7d, data.visitsPrevious7d)} />
              <Tile label="Visits, last 4 weeks" value={big(data.visits28d)} />
              <Tile
                label="Average visits a day"
                value={averagePerDay < 10 ? averagePerDay.toFixed(1).replace(/\.0$/, "") : fmt(averagePerDay)}
                note={daysCounted < WINDOW_DAYS ? `Over the ${daysCounted} days since counting began` : "Over the last 4 weeks"}
              />
            </dl>
            <div className={CARD}>
              <h3 className={CARD_TITLE}>Visits per day</h3>
              <p className={LEAD}>
                The busiest day was <strong className="text-[var(--text-primary)]">{dayLabel(busiestDay.day, true)}</strong>,
                with {fmt(busiestDay.visits)}.
              </p>
              <div className="mt-5">
                <ColumnChart
                  title="Visits per day, last four weeks"
                  summary={`Busiest day ${dayLabel(busiestDay.day, true)}, with ${fmt(busiestDay.visits)} visits.`}
                  columns={dailyColumns}
                  unit={["visit", "visits"]}
                  labelHeading="Day"
                />
              </div>
            </div>
          </Group>

          <Group id="stats-engagement" title="Engagement" blurb="What people do once they are here, over the last four weeks.">
            <dl className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              <Tile label="Sessions started" value={big(data.sessions28d)} />
              <Tile label="Hours of listening" value={hoursValue(data.listeningHours28d)} note="Counted in 5-minute steps" />
              <Tile
                label="Sessions per visit"
                value={sessionsPerVisit.toFixed(1)}
                note="Sessions started for each visit"
              />
            </dl>
            {lengthTotal > 0 && (
              <div className={CARD}>
                <h3 className={CARD_TITLE}>How long sessions last, in minutes</h3>
                <p className={LEAD}>
                  <strong className="text-[var(--text-primary)]">{percent(fivePlus, lengthTotal)}%</strong> of sessions
                  lasted 5 minutes or more.
                </p>
                <div className="mt-5">
                  <ColumnChart
                    title="Sessions by length, last four weeks"
                    summary={`${percent(fivePlus, lengthTotal)}% lasted 5 minutes or more.`}
                    columns={lengthColumns}
                    unit={["session", "sessions"]}
                    labelHeading="Length"
                    centerTicks
                  />
                </div>
              </div>
            )}
          </Group>

          {(hourTotal > 0 || weekdayTotal > 0) && (
            <Group id="stats-timing" title="When" blurb="The times people reach for CRUX, in Sydney time.">
              <div className="grid gap-5 lg:grid-cols-2">
                {hourTotal > 0 && (
                  <div className={CARD}>
                    <h3 className={CARD_TITLE}>Time of day</h3>
                    <p className={LEAD}>
                      Busiest between <strong className="text-[var(--text-primary)]">{clock(busiestHour)} and {clock(busiestHour + 1)}</strong>.
                    </p>
                    <div className="mt-5">
                      <ColumnChart
                        title="Visits by hour of the day, Sydney time"
                        summary={`Busiest hour ${clock(busiestHour)} to ${clock(busiestHour + 1)}.`}
                        columns={hourColumns}
                        unit={["visit", "visits"]}
                        labelHeading="Hour, Sydney time"
                      />
                    </div>
                  </div>
                )}
                {weekdayTotal > 0 && (
                  <div className={CARD}>
                    <h3 className={CARD_TITLE}>Day of the week</h3>
                    <p className={LEAD}>
                      <strong className="text-[var(--text-primary)]">{busiestWeekday}</strong> is the busiest day.
                    </p>
                    <div className="mt-5">
                      <ColumnChart
                        title="Visits by day of the week"
                        summary={`Busiest day of the week ${busiestWeekday}.`}
                        columns={weekdayColumns}
                        unit={["visit", "visits"]}
                        labelHeading="Day of the week"
                        centerTicks
                      />
                    </div>
                  </div>
                )}
              </div>
            </Group>
          )}

          {(data.tools.length > 0 || data.items.length > 0) && (
            <Group id="stats-use" title="What people use" blurb="Ranked by sessions started or by hours listened, over the last four weeks.">
              <div className="grid gap-5 lg:grid-cols-2">
                {data.tools.length > 0 && (
                  <div className={CARD}>
                    <h3 className={`${CARD_TITLE} mb-4`}>Tools</h3>
                    <MetricBars rows={data.tools} label="Tools" />
                  </div>
                )}
                {data.items.length > 0 && (
                  <div className={CARD}>
                    <h3 className={`${CARD_TITLE} mb-4`}>Most played</h3>
                    <MetricBars rows={data.items} label="Most played sessions" limit={5} />
                  </div>
                )}
              </div>
            </Group>
          )}

          {(data.devices.length > 0 || data.countries.length > 0) && (
            <Group id="stats-audience" title="Who" blurb="The devices and places visits come from, over the last four weeks.">
              <div className="grid gap-5 lg:grid-cols-2">
                {data.devices.length > 0 && (
                  <div className={CARD}>
                    <h3 className={`${CARD_TITLE} mb-5`}>Device</h3>
                    <SplitBar parts={data.devices} label="Visits by device" />
                  </div>
                )}
                {data.countries.length > 0 && (
                  <div className={CARD}>
                    <h3 className={`${CARD_TITLE} mb-5`}>Country</h3>
                    <SplitBar parts={data.countries} label="Visits by country" />
                  </div>
                )}
              </div>
            </Group>
          )}

          {(data.quiz.started ?? 0) > 0 && (
            <Group id="stats-learning" title="Learning" blurb={`The Your Brain check: nine questions on the stress loop, since ${launchDate}.`}>
              <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Tile label="Checks started" value={big(data.quiz.started ?? 0)} />
                <Tile label="Checks completed" value={data.quiz.completed === null ? "–" : big(data.quiz.completed)} />
                <Tile label="Completion rate" value={quizRate === null ? "–" : `${quizRate}%`} />
                <Tile
                  label="Average score"
                  value={
                    data.quiz.averageScore === null
                      ? "–"
                      : `${data.quiz.averageScore.toFixed(1).replace(/\.0$/, "")}${data.quiz.outOf ? ` / ${data.quiz.outOf}` : ""}`
                  }
                />
              </dl>
            </Group>
          )}
        </>
      )}

      <section aria-labelledby="stats-about" className={`${CARD} mt-12`}>
        <h2 id="stats-about" className="text-[22px] font-bold leading-none text-[var(--text-primary)]">
          About these numbers
        </h2>
        <ul className="mt-4 flex list-disc flex-col gap-2 pl-5 text-[15px] leading-relaxed text-[var(--text-secondary)]">
          <li>They are anonymous. There are no accounts, no cookies and nothing that identifies anyone.</li>
          <li>
            A visit is one person on one day. Vercel, the service that hosts CRUX, counts people with an anonymous code
            that resets every day, so the same person on two days counts as two visits.
          </li>
          <li>
            Not measured yet: how many different people use CRUX over a month, and how many come back. That needs the
            app&apos;s own visit log, which is built but not switched on.
          </li>
          <li>Times of day are Sydney time. Daily totals run midnight to midnight UTC, which is mid-morning in Sydney.</li>
          <li>Listening time is counted in 5-minute steps, so sessions under 5 minutes add nothing to it.</li>
          <li>Counting began on {launchDate}. The numbers refresh every hour.</li>
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
            How many people use CRUX, how they use it, and when. Anonymous counts, updated every hour.
          </p>
          {result.state === "ok" && (
            <div className="mt-5 flex flex-col items-center gap-3">
              <p className="text-[14px] text-[var(--text-secondary)]">Updated {updatedAt(result.data.generatedAt)}, Sydney time</p>
              <PrintButton />
            </div>
          )}
        </div>

        {result.state === "off" && (
          <Message title="Not switched on yet">The numbers will appear here once CRUX is connected to its analytics.</Message>
        )}
        {result.state === "error" && (
          <Message title="Couldn't load the numbers">
            Something went wrong fetching them. They will be back at the next refresh, within the hour.
          </Message>
        )}
        {result.state === "ok" && <Numbers data={result.data} />}

        <p className="no-print mt-10 text-center">
          <Link href="/about" className="btn-ghost min-h-11">
            Back to About
          </Link>
        </p>
      </div>
    </main>
  );
}
