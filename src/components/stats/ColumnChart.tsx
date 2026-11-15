"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

/**
 * A single-series column chart for the "CRUX in numbers" page.
 *
 * Drawn as inline SVG (no chart library, nothing the strict CSP would block).
 * The SVG is sized to the measured card width so bars get real pixels and the
 * axis text stays at 12px on a phone.
 *
 * Reading the values, without relying on colour or a mouse:
 *   - hover or tap a column: a readout shows its label and value
 *   - Tab to the chart, then the arrow keys (and Home / End) step through the
 *     columns, and each step is announced to screen readers
 *   - "Show as a table" lists every value; screen readers always have the table
 * The peak is the one value printed on the chart itself.
 */

export interface Column {
  key: string;
  /** Full label, for the readout and the table, e.g. "Tue 10 Nov" or "9 pm to 10 pm". */
  label: string;
  /** Short x-axis label. Columns without one get no axis label. */
  tick?: string;
  value: number;
}

interface Props {
  /** Names the chart: the table caption and the keyboard group's label. */
  title: string;
  /** One sentence a screen reader hears first, e.g. the peak. */
  summary: string;
  columns: Column[];
  /** Singular and plural for the values, e.g. ["visit", "visits"]. */
  unit: [string, string];
  /** Heading for the label column of the table. */
  labelHeading: string;
  /**
   * Centre every axis label under its own column. For categories (weekdays,
   * length bands). Time series leave it off, so the first and last labels sit
   * at the chart's edges and never run past them.
   */
  centerTicks?: boolean;
}

const TOP_PAD = 24; // room for the peak label
const PLOT_HEIGHT = 150;
const AXIS_BAND = 26;
const HEIGHT = TOP_PAD + PLOT_HEIGHT + AXIS_BAND;
const MAX_BAR_WIDTH = 24;
const DIGIT_WIDTH = 7.5; // rough width of one 12px digit

function niceMax(max: number): number {
  if (!(max > 0)) return 1;
  const base = Math.pow(10, Math.floor(Math.log10(max)));
  for (const step of [1, 2, 5, 10]) {
    if (step * base >= max) return step * base;
  }
  return 10 * base;
}

function compact(n: number): string {
  if (n >= 10_000) {
    const k = n / 1000;
    return `${Number.isInteger(k) ? k : k.toFixed(1)}K`;
  }
  return n.toLocaleString("en-AU");
}

/** A column with a 4px rounded top and a square foot on the baseline. */
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

export default function ColumnChart({ title, summary, columns, unit, labelHeading, centerTicks = false }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const [announce, setAnnounce] = useState("");
  const [showTable, setShowTable] = useState(false);
  const tableId = useId();

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

  const count = columns.length;
  const values = columns.map((c) => Math.max(0, Math.round(c.value)));
  let peakIndex = -1;
  values.forEach((v, i) => {
    if (v > 0 && (peakIndex < 0 || v > values[peakIndex])) peakIndex = i;
  });
  const peak = peakIndex >= 0 ? values[peakIndex] : 0;

  const words = (v: number) => `${v.toLocaleString("en-AU")} ${v === 1 ? unit[0] : unit[1]}`;

  const yMax = niceMax(peak);
  const yMaxLabel = compact(yMax);
  const gutter = 10 + yMaxLabel.length * DIGIT_WIDTH;
  const plotLeft = gutter;
  const plotRight = Math.max(plotLeft, width - 4);
  const plotWidth = plotRight - plotLeft;
  const band = count > 0 ? plotWidth / count : 0;
  const gap = Math.min(2, Math.max(0.5, band / 3));
  const barWidth = Math.min(MAX_BAR_WIDTH, Math.max(1, band - gap));
  const radius = Math.min(4, barWidth / 2);
  const baseline = TOP_PAD + PLOT_HEIGHT;

  const bandStart = (i: number) => plotLeft + i * band;
  const barCentre = (i: number) => bandStart(i) + band / 2;
  const barTop = (v: number) => baseline - (v / yMax) * PLOT_HEIGHT;

  const peakText = peak.toLocaleString("en-AU");
  const peakHalf = (peakText.length * DIGIT_WIDTH) / 2 + 2;
  const peakX =
    peakIndex >= 0 ? Math.min(Math.max(barCentre(peakIndex), plotLeft + peakHalf), plotRight - peakHalf) : 0;

  const indexAt = (clientX: number): number | null => {
    const host = hostRef.current;
    if (!host || band <= 0) return null;
    const x = clientX - host.getBoundingClientRect().left;
    if (x < plotLeft || x > plotRight) return null;
    return Math.min(count - 1, Math.max(0, Math.floor((x - plotLeft) / band)));
  };

  const onPointer = (event: PointerEvent<HTMLDivElement>) => setActive(indexAt(event.clientX));

  const move = (next: number) => {
    const i = Math.min(count - 1, Math.max(0, next));
    setActive(i);
    setAnnounce(`${columns[i].label}: ${words(values[i])}`);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (count === 0) return;
    const current = active ?? (peakIndex >= 0 ? peakIndex : count - 1);
    const keys: Record<string, number> = {
      ArrowRight: current + 1,
      ArrowLeft: current - 1,
      ArrowUp: current + 1,
      ArrowDown: current - 1,
      Home: 0,
      End: count - 1,
    };
    if (event.key === "Escape") {
      setActive(null);
      return;
    }
    if (!(event.key in keys)) return;
    event.preventDefault();
    move(active === null ? current : keys[event.key]);
  };

  // The readout sits above the active column, kept inside the card.
  const readoutWidth = 180;
  const readoutLeft =
    active !== null ? Math.min(Math.max(barCentre(active) - readoutWidth / 2, 0), Math.max(0, width - readoutWidth)) : 0;

  return (
    <div>
      <div
        ref={hostRef}
        className="relative w-full rounded-xl outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary)]"
        style={{ height: HEIGHT }}
        tabIndex={0}
        role="group"
        aria-label={`${title}. ${summary} Use the arrow keys to read each value.`}
        onPointerMove={onPointer}
        onPointerDown={onPointer}
        onPointerLeave={() => setActive(null)}
        onKeyDown={onKeyDown}
        onFocus={() => {
          if (active === null && count > 0) move(peakIndex >= 0 ? peakIndex : count - 1);
        }}
        onBlur={() => setActive(null)}
      >
        {width > 0 && (
          <svg
            viewBox={`0 0 ${width} ${HEIGHT}`}
            width="100%"
            height={HEIGHT}
            aria-hidden="true"
            className="block select-none"
            style={{ fontSize: 12, fontFamily: "inherit" }}
          >
            {/* Top gridline at the axis maximum, and the baseline: solid hairlines */}
            <line x1={plotLeft} x2={plotRight} y1={TOP_PAD} y2={TOP_PAD} stroke="var(--border-color)" strokeWidth="1" />
            <line x1={plotLeft} x2={plotRight} y1={baseline} y2={baseline} stroke="var(--text-secondary)" strokeOpacity="0.6" strokeWidth="1" />

            <text x={gutter - 6} y={TOP_PAD + 4} textAnchor="end" fill="var(--text-secondary)" style={{ fontVariantNumeric: "tabular-nums" }}>
              {yMaxLabel}
            </text>
            <text x={gutter - 6} y={baseline + 4} textAnchor="end" fill="var(--text-secondary)" style={{ fontVariantNumeric: "tabular-nums" }}>
              0
            </text>

            {columns.map((column, i) => {
              const v = values[i];
              const top = barTop(v);
              const height = baseline - top;
              const isActive = active === i;
              return (
                <g key={column.key}>
                  {isActive && (
                    <rect
                      x={bandStart(i)}
                      y={TOP_PAD}
                      width={Math.max(band, 1)}
                      height={PLOT_HEIGHT}
                      fill="var(--text-primary)"
                      fillOpacity="0.06"
                    />
                  )}
                  {height > 0 && (
                    <path
                      d={barPath(bandStart(i) + (band - barWidth) / 2, top, barWidth, height, radius)}
                      fill={isActive ? "var(--primary-light)" : "var(--accent-2)"}
                    />
                  )}
                </g>
              );
            })}

            {/* The one direct label: the peak */}
            {peakIndex >= 0 && (
              <text x={peakX} y={barTop(peak) - 7} textAnchor="middle" fill="var(--text-primary)" fontWeight="600">
                {peakText}
              </text>
            )}

            {/* x-axis labels */}
            {columns.map((column, i) => {
              if (!column.tick) return null;
              const isFirst = !centerTicks && i === 0;
              const isLast = !centerTicks && i === count - 1;
              const x = isFirst ? plotLeft : isLast ? plotRight : barCentre(i);
              const anchor = isFirst ? "start" : isLast ? "end" : "middle";
              return (
                <text key={`tick-${column.key}`} x={x} y={baseline + 18} textAnchor={anchor} fill="var(--text-secondary)">
                  {column.tick}
                </text>
              );
            })}
          </svg>
        )}

        {/* The readout: value first, then what it is */}
        {active !== null && width > 0 && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute z-10 rounded-xl border border-[var(--border-color)] bg-[var(--surface-solid)] px-3 py-2 shadow-lg"
            style={{ left: readoutLeft, top: 0, width: readoutWidth }}
          >
            <p className="text-[16px] font-bold leading-tight text-[var(--text-primary)]">{words(values[active])}</p>
            <p className="text-[13px] leading-snug text-[var(--text-secondary)]">{columns[active].label}</p>
          </div>
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        {announce}
      </p>

      <button
        type="button"
        onClick={() => setShowTable((v) => !v)}
        aria-expanded={showTable}
        aria-controls={tableId}
        className="no-print btn-ghost mt-4 min-h-11"
      >
        {showTable ? "Hide the table" : "Show as a table"}
      </button>

      <div id={tableId} className={showTable ? "mt-4 overflow-x-auto" : "sr-only"}>
        <table className="w-full border-collapse text-left text-[14px]">
          <caption className="sr-only">{title}</caption>
          <thead>
            <tr className="border-b border-[var(--border-color)]">
              <th scope="col" className="py-2 pr-4 font-semibold text-[var(--text-primary)]">
                {labelHeading}
              </th>
              <th scope="col" className="py-2 text-right font-semibold text-[var(--text-primary)]">
                {unit[1].charAt(0).toUpperCase() + unit[1].slice(1)}
              </th>
            </tr>
          </thead>
          <tbody>
            {columns.map((column, i) => (
              <tr key={column.key} className="border-b border-[var(--border-color)]">
                <td className="py-2 pr-4 text-[var(--text-secondary)]">{column.label}</td>
                <td className="py-2 text-right text-[var(--text-primary)]" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {values[i].toLocaleString("en-AU")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
