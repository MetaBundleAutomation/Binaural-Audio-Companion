"use client";

import { useState } from "react";

/**
 * Ranked horizontal bars with a switch between two measures: sessions started
 * and hours of listening. One colour; the name and both figures are printed as
 * text on every row, so nothing depends on reading the bar.
 */

export interface MetricRow {
  key: string;
  name: string;
  /** Secondary label, e.g. the tool an item belongs to. */
  detail?: string;
  sessions: number;
  hours: number;
}

type Metric = "sessions" | "hours";

const fmt = (n: number) => Math.round(n).toLocaleString("en-AU");

function hoursText(n: number): string {
  const value = n > 0 && n < 10 ? n.toFixed(1).replace(/\.0$/, "") : fmt(n);
  return `${value} ${value === "1" ? "hour" : "hours"}`;
}

const sessionsText = (n: number) => `${fmt(n)} ${n === 1 ? "session" : "sessions"}`;

export default function MetricBars({
  rows,
  label,
  limit,
}: {
  rows: MetricRow[];
  /** Names the list for screen readers, e.g. "Tools". */
  label: string;
  /** How many rows to show. */
  limit?: number;
}) {
  const [metric, setMetric] = useState<Metric>("sessions");

  const sorted = [...rows]
    .sort((a, b) => b[metric] - a[metric] || b.sessions - a.sessions)
    .filter((row) => row[metric] > 0)
    .slice(0, limit ?? rows.length);
  const max = Math.max(1e-9, ...sorted.map((r) => r[metric]));

  return (
    <div>
      <div role="group" aria-label={`Rank ${label.toLowerCase()} by`} className="no-print inline-flex rounded-full border border-[var(--border-color)] p-1">
        {(["sessions", "hours"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setMetric(option)}
            aria-pressed={metric === option}
            className={`min-h-11 rounded-full border px-4 text-[14px] font-semibold transition-colors ${
              metric === option
                ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] text-[var(--text-primary)]"
                : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {option === "sessions" ? "Sessions" : "Hours listened"}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <p className="mt-5 text-[15px] text-[var(--text-secondary)]">
          {metric === "hours" ? "No sessions have reached 5 minutes yet." : "Nothing yet."}
        </p>
      ) : (
        <ol className="mt-5 flex flex-col gap-4" aria-label={`${label}, by ${metric === "sessions" ? "sessions started" : "hours listened"}`}>
          {sorted.map((row, index) => (
            <li key={row.key}>
              <div className="flex items-baseline justify-between gap-x-4">
                <span className="min-w-0 text-[16px] font-semibold leading-snug text-[var(--text-primary)]">
                  <span className="mr-2 text-[var(--text-secondary)]" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {index + 1}.
                  </span>
                  {row.name}
                  {row.detail && (
                    <>
                      {" "}
                      <span className="ml-1 text-[14px] font-normal text-[var(--text-secondary)]">{row.detail}</span>
                    </>
                  )}
                </span>
                <span className="shrink-0 text-right text-[14px] leading-snug" style={{ fontVariantNumeric: "tabular-nums" }}>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {metric === "sessions" ? sessionsText(row.sessions) : hoursText(row.hours)}
                  </span>
                  <span className="block text-[13px] text-[var(--text-secondary)]">
                    {metric === "sessions" ? hoursText(row.hours) : sessionsText(row.sessions)}
                  </span>
                </span>
              </div>
              <div className="mt-1.5 h-3 w-full" aria-hidden="true">
                <div
                  className="h-3 rounded-r bg-[var(--accent-2)]"
                  style={{ width: `${Math.max(1.5, (row[metric] / max) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
