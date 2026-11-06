"use client";

import { useMemo, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { financialYear, formatCents, formatDate, sumCents, type Bill } from "@/lib/bills";
import { FIELD, LABEL, SECTION_TITLE, pill } from "./styles";

type Range = "this" | "last" | "custom";

/**
 * Paid history: every bill marked as paid, by Australian financial year or a
 * custom range, with a running total and a print button. Printing gives a
 * clean black-on-white page to hand to a tax agent.
 */
export default function HistoryTab({
  bills,
  today,
  onUnpaid,
}: {
  bills: Bill[];
  today: string;
  onUnpaid: (id: string) => void;
}) {
  const thisYear = financialYear(today);
  const lastYear = financialYear(today, -1);

  const [range, setRange] = useState<Range>("this");
  const [from, setFrom] = useState(thisYear.from);
  const [to, setTo] = useState(today);

  const span =
    range === "this"
      ? { from: thisYear.from, to: thisYear.to }
      : range === "last"
        ? { from: lastYear.from, to: lastYear.to }
        : { from, to };

  const paid = useMemo(
    () =>
      bills
        .filter((b): b is Bill & { paidOn: string } => Boolean(b.paidOn))
        .filter((b) => b.paidOn >= span.from && b.paidOn <= span.to)
        .sort((a, b) => b.paidOn.localeCompare(a.paidOn)),
    [bills, span.from, span.to],
  );

  const total = sumCents(paid);
  const rangeText = `${formatDate(span.from, true)} to ${formatDate(span.to, true)}`;

  const print = () => {
    trackEvent("bills_print");
    window.print();
  };

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="history-range" className="no-print card p-4 sm:p-6">
        <h2 id="history-range" className={SECTION_TITLE}>
          Choose a date range
        </h2>
        <div role="group" aria-label="Date range" className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => setRange("this")} aria-pressed={range === "this"} className={pill(range === "this")}>
            This financial year
          </button>
          <button type="button" onClick={() => setRange("last")} aria-pressed={range === "last"} className={pill(range === "last")}>
            Last financial year
          </button>
          <button type="button" onClick={() => setRange("custom")} aria-pressed={range === "custom"} className={pill(range === "custom")}>
            Choose dates
          </button>
        </div>
        {range === "custom" && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="history-from" className={LABEL}>
                From
              </label>
              <input id="history-from" type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className={FIELD} />
            </div>
            <div>
              <label htmlFor="history-to" className={LABEL}>
                To
              </label>
              <input id="history-to" type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className={FIELD} />
            </div>
          </div>
        )}
      </section>

      <section aria-labelledby="history-list" className="print-area card p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="history-list" className={SECTION_TITLE}>
              Paid bills
            </h2>
            <p className="mt-1.5 text-[15px] text-[var(--text-secondary)]">{rangeText}</p>
          </div>
          <button type="button" onClick={print} className="no-print btn-secondary">
            Print
          </button>
        </div>

        {paid.length === 0 ? (
          <p className="mt-5 text-[16px] leading-relaxed text-[var(--text-secondary)]">
            No paid bills in this range. When you mark a bill as paid it shows up here.
          </p>
        ) : (
          <>
            <ul className="mt-5 flex flex-col">
              {paid.map((bill) => (
                <li
                  key={bill.id}
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-[var(--border-color)] py-3"
                >
                  <div className="min-w-0">
                    <p className="break-words text-[17px] font-semibold leading-snug text-[var(--text-primary)]">{bill.name}</p>
                    <p className="text-[14px] leading-snug text-[var(--text-secondary)]">
                      {bill.category} · Paid {formatDate(bill.paidOn, true)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-[18px] font-bold text-[var(--text-primary)]">{formatCents(bill.cents)}</p>
                    <button type="button" onClick={() => onUnpaid(bill.id)} className="no-print btn-ghost min-h-11">
                      Not paid
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <p className="flex items-baseline justify-between gap-4 border-t-2 border-[var(--text-secondary)] pt-4 text-[var(--text-primary)]">
              <span className="text-[17px] font-semibold">
                Total, {paid.length} {paid.length === 1 ? "bill" : "bills"}
              </span>
              <span className="text-[24px] font-bold">{formatCents(total)}</span>
            </p>
          </>
        )}
      </section>
    </div>
  );
}
