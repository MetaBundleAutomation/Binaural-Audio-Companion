"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Visitors per day as a single-series column chart, drawn as inline SVG so it
 * works under the strict CSP (no chart library, no data: URIs). The SVG is
 * sized to the measured card width so the bars get real pixels and the text
 * stays at 11px on a phone; the viewBox mirrors that size so it still scales
 * cleanly between measurements. A visually hidden table carries the same
 * numbers for screen readers, and each bar's `<title>` is its tooltip.
 */

export interface UsageChartProps {
  /** How many days the toggle asked for (used in the summary wording). */
  days: number;
  /** One entry per day, oldest first. `day` is YYYY-MM-DD. */
  data: { day: string; visitors: number }[];
}

const TOP_PAD = 18; // room for the peak label above the tallest bar
const PLOT_HEIGHT = 120;
const AXIS_BAND = 22; // x-axis labels
const HEIGHT = TOP_PAD + PLOT_HEIGHT + AXIS_BAND;
const MAX_BAR_WIDTH = 24;
const CHAR_WIDTH = 7; // rough width of one 11px digit, for the y-axis gutter

function parseDay(day: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function formatDay(day: string, month: "short" | "long"): string {
  const d = parseDay(day);
  if (!d) return day;
  return d.toLocaleDateString("en-AU", { day: "numeric", month });
}

function formatDayWithWeekday(day: string): string {
  const d = parseDay(day);
  if (!d) return day;
  return d.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });
}

/** The smallest "clean" number (1, 2, 5 × 10^k) at or above `max`; 1 for empty data. */
function niceMax(max: number): number {
  if (!(max > 0)) return 1;
  const base = Math.pow(10, Math.floor(Math.log10(max)));
  for (const step of [1, 2, 5, 10]) {
    if (step * base >= max) return step * base;
  }
  return 10 * base;
}

/** Axis ticks compact from 1,000 up: 0 / 1K / 2.5K. */
function compact(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return `${Number.isInteger(k) ? k : k.toFixed(1)}K`;
  }
  return n.toLocaleString("en-AU");
}

/** A column with a rounded top and a square foot on the baseline. */
function barPath(x: number, top: number, width: number, height: number, radius: number): string {
  const r = Math.min(radius, height, width / 2);
  const bottom = top + height;
  return [
    `M${x},${bottom}`,
    `V${top + r}`,
    `Q${x},${top} ${x + r},${top}`,
    `H${x + width - r}`,
    `Q${x + width},${top} ${x + width},${top + r}`,
    `V${bottom}`,
    "Z",
  ].join(" ");
}

/** Which bars get an x-axis label: first and last, plus a few evenly spaced ones when dense. */
function labelIndices(count: number, plotWidth: number): number[] {
  if (count <= 0) return [];
  if (count === 1) return [0];
  if (count < 30) return [0, count - 1];
  const wanted = Math.max(2, Math.min(6, Math.floor(plotWidth / 72)));
  const indices = new Set<number>();
  for (let k = 0; k < wanted; k++) {
    indices.add(Math.round((k * (count - 1)) / (wanted - 1)));
  }
  return [...indices].sort((a, b) => a - b);
}

export default function UsageChart({ days, data }: UsageChartProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const measure = () => setWidth(Math.round(host.getBoundingClientRect().width));
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  const rows = Array.isArray(data) ? data : [];
  const values = rows.map((d) => Math.max(0, Math.round(Number(d.visitors) || 0)));
  const count = rows.length;

  let peak = 0;
  let peakIndex = -1;
  values.forEach((v, i) => {
    if (v > peak) {
      peak = v;
      peakIndex = i;
    }
  });

  const yMax = niceMax(peak);
  const yMaxLabel = compact(yMax);
  const summary =
    peak > 0 && peakIndex >= 0
      ? `Visitors per day over the last ${days} days, peak ${peak.toLocaleString("en-AU")} on ${formatDay(rows[peakIndex].day, "long")}`
      : `Visitors per day over the last ${days} days, no visitors yet`;

  // Geometry, all in CSS pixels because the viewBox matches the measured width.
  const gutter = 10 + yMaxLabel.length * CHAR_WIDTH;
  const plotLeft = gutter;
  const plotRight = Math.max(plotLeft, width - 4);
  const plotWidth = plotRight - plotLeft;
  const band = count > 0 ? plotWidth / count : 0;
  // A 2px surface gap between bars, narrowing only when 90 bars must share a phone.
  const gap = Math.min(2, Math.max(0.5, band / 3));
  const barWidth = Math.min(MAX_BAR_WIDTH, Math.max(0.75, band - gap));
  const radius = Math.min(4, barWidth / 2);
  const baseline = TOP_PAD + PLOT_HEIGHT;
  const ticks = labelIndices(count, plotWidth);

  const bandStart = (i: number) => plotLeft + i * band;
  const barLeft = (i: number) => bandStart(i) + (band - barWidth) / 2;
  const barCentre = (i: number) => bandStart(i) + band / 2;

  // Keep the peak label inside the plot so it never overlaps the y-axis gutter.
  const peakText = peak.toLocaleString("en-AU");
  const peakHalfWidth = (peakText.length * CHAR_WIDTH) / 2 + 2;
  const peakX =
    peakIndex >= 0
      ? Math.min(Math.max(barCentre(peakIndex), plotLeft + peakHalfWidth), plotRight - peakHalfWidth)
      : 0;
  const peakY = baseline - (peak / yMax) * PLOT_HEIGHT - 5;

  return (
    <div>
      <div ref={hostRef} className="w-full" style={{ height: HEIGHT }}>
        {width > 0 && (
          <svg
            viewBox={`0 0 ${width} ${HEIGHT}`}
            width="100%"
            height={HEIGHT}
            role="img"
            aria-label={summary}
            className="block"
            style={{ fontSize: 11, fontFamily: "inherit" }}
          >
            {/* Brand gradient for the bars: accent-2 at the top fading to accent at the foot */}
            <defs>
              <linearGradient id="usage-bar-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" style={{ stopColor: "var(--accent-2)" }} />
                <stop offset="1" style={{ stopColor: "var(--accent)" }} />
              </linearGradient>
            </defs>

            {/* Top gridline at the axis max, and the baseline */}
            <line
              x1={plotLeft}
              x2={plotRight}
              y1={TOP_PAD}
              y2={TOP_PAD}
              stroke="var(--text-secondary)"
              strokeOpacity="0.25"
              strokeWidth="1"
            />
            <line
              x1={plotLeft}
              x2={plotRight}
              y1={baseline}
              y2={baseline}
              stroke="var(--text-secondary)"
              strokeOpacity="0.6"
              strokeWidth="1"
            />

            {/* y-axis: max and zero */}
            <text
              x={gutter - 6}
              y={TOP_PAD + 4}
              textAnchor="end"
              fill="var(--text-secondary)"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {yMaxLabel}
            </text>
            <text
              x={gutter - 6}
              y={baseline + 4}
              textAnchor="end"
              fill="var(--text-secondary)"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              0
            </text>

            {/* Bars: the whole day band is the hover target, the bar lifts on hover */}
            {rows.map((row, i) => {
              const v = values[i];
              const height = (v / yMax) * PLOT_HEIGHT;
              return (
                <g key={`${row.day}-${i}`} className="group">
                  <title>
                    {`${formatDayWithWeekday(row.day)}: ${v.toLocaleString("en-AU")} ${v === 1 ? "visitor" : "visitors"}`}
                  </title>
                  <rect
                    x={bandStart(i)}
                    y={TOP_PAD}
                    width={Math.max(band, 1)}
                    height={PLOT_HEIGHT}
                    fill="transparent"
                  />
                  {height > 0 && (
                    <path
                      d={barPath(barLeft(i), baseline - height, barWidth, height, radius)}
                      fill="url(#usage-bar-fill)"
                      className="group-hover:fill-[var(--primary-light)] transition-colors"
                    />
                  )}
                </g>
              );
            })}

            {/* The one direct label: the peak */}
            {peak > 0 && peakIndex >= 0 && (
              <text
                x={peakX}
                y={peakY}
                textAnchor="middle"
                fill="var(--text-primary)"
                fontWeight="600"
              >
                {peakText}
              </text>
            )}

            {/* x-axis: first and last day, plus a few in between when dense */}
            {ticks.map((i) => {
              const isFirst = i === 0;
              const isLast = i === count - 1;
              const x = isFirst ? plotLeft : isLast ? plotRight : barCentre(i);
              const anchor = isFirst ? "start" : isLast ? "end" : "middle";
              return (
                <text
                  key={i}
                  x={x}
                  y={baseline + 15}
                  textAnchor={anchor}
                  fill="var(--text-secondary)"
                >
                  {formatDay(rows[i].day, "short")}
                </text>
              );
            })}
          </svg>
        )}
      </div>

      {/* The same numbers as a table, for screen readers and anyone without hover */}
      <table className="sr-only">
        <caption>Visitors per day over the last {days} days</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Visitors</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={`${row.day}-${i}`}>
              <td>{formatDay(row.day, "long")}</td>
              <td>{values[i].toLocaleString("en-AU")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
