/**
 * One whole split into up to three parts: a segmented bar with a legend
 * underneath that prints every part's name, share and count as text.
 *
 * The three colours are the first three slots of the validated reference
 * palette, stepped for dark surfaces (blue, orange, aqua). They pass the
 * colour-blindness and normal-vision separation checks as a set, and clear
 * 3:1 against every theme's card except orange on the Bright slate surface
 * (2.9:1), where the printed legend carries the values. Text never sits on
 * the colours, so all text keeps the 7:1 rule.
 */

export const SPLIT_COLOURS = ["#3987e5", "#d95926", "#199e70"] as const;

export interface SplitPart {
  key: string;
  label: string;
  visits: number;
}

export default function SplitBar({ parts, label }: { parts: SplitPart[]; label: string }) {
  const shown = parts.filter((p) => p.visits > 0).slice(0, SPLIT_COLOURS.length);
  const total = shown.reduce((sum, p) => sum + p.visits, 0);
  if (total === 0) return <p className="text-[15px] text-[var(--text-secondary)]">Nothing counted yet.</p>;

  const share = (v: number) => Math.round((v / total) * 100);
  const summary = shown.map((p) => `${p.label} ${share(p.visits)}%`).join(", ");

  return (
    <div>
      <div className="flex h-6 w-full gap-[2px] overflow-hidden rounded-full" role="img" aria-label={`${label}: ${summary}`}>
        {shown.map((part, i) => (
          <div
            key={part.key}
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{ width: `${(part.visits / total) * 100}%`, background: SPLIT_COLOURS[i], minWidth: 4 }}
          />
        ))}
      </div>
      <ul className="mt-4 flex flex-col gap-2.5">
        {shown.map((part, i) => (
          <li key={part.key} className="flex items-center gap-3 text-[15px]">
            <span aria-hidden="true" className="h-3.5 w-3.5 shrink-0 rounded-[4px]" style={{ background: SPLIT_COLOURS[i] }} />
            <span className="grow font-semibold text-[var(--text-primary)]">{part.label}</span>
            <span className="font-semibold text-[var(--text-primary)]" style={{ fontVariantNumeric: "tabular-nums" }}>
              {share(part.visits)}%
            </span>
            <span className="w-24 text-right text-[14px] text-[var(--text-secondary)]" style={{ fontVariantNumeric: "tabular-nums" }}>
              {part.visits.toLocaleString("en-AU")} {part.visits === 1 ? "visit" : "visits"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
