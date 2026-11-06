"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatCents, formatDate, sumCents, type Bill } from "@/lib/bills";
import { SECTION_TITLE } from "./styles";

/**
 * A large-key calculator, plus a tick list of unpaid bills whose total can be
 * dropped straight into it.
 *
 * It works the way a pocket calculator does: each operator acts on the running
 * result. The percent key follows the phone convention, so 200 + 10 % adds 20.
 */

type Op = "+" | "−" | "×" | "÷";

interface Calc {
  /** What is on the screen, as typed. */
  display: string;
  /** The running result, waiting on the next number. */
  stored: number | null;
  op: Op | null;
  /** True when the next digit starts a new number. */
  fresh: boolean;
}

const START: Calc = { display: "0", stored: null, op: null, fresh: true };
const ERROR = "Cannot divide by 0";
const MAX_DIGITS = 12;

function tidy(value: number): string {
  if (!Number.isFinite(value)) return ERROR;
  // Twelve significant figures hides binary rounding such as 0.1 + 0.2.
  const rounded = Number(value.toPrecision(MAX_DIGITS));
  return String(rounded);
}

function apply(a: number, b: number, op: Op): number {
  if (op === "+") return a + b;
  if (op === "−") return a - b;
  if (op === "×") return a * b;
  return b === 0 ? Number.NaN : a / b;
}

function press(state: Calc, key: string): Calc {
  if (state.display === ERROR && key !== "Clear") return press(START, key);

  if (/^\d$/.test(key)) {
    if (state.fresh) return { ...state, display: key, fresh: false };
    if (state.display.replace(/[-.]/g, "").length >= MAX_DIGITS) return state;
    return { ...state, display: state.display === "0" ? key : state.display + key };
  }
  if (key === ".") {
    if (state.fresh) return { ...state, display: "0.", fresh: false };
    return state.display.includes(".") ? state : { ...state, display: `${state.display}.` };
  }
  if (key === "Clear") return START;
  if (key === "Back") {
    if (state.fresh) return state;
    const shorter = state.display.slice(0, -1);
    return { ...state, display: shorter === "" || shorter === "-" ? "0" : shorter };
  }

  const current = Number(state.display);

  if (key === "%") {
    // With an operator waiting, a percentage is of the stored number for + and −.
    const value =
      state.stored !== null && (state.op === "+" || state.op === "−")
        ? (state.stored * current) / 100
        : current / 100;
    return { ...state, display: tidy(value), fresh: false };
  }

  if (key === "=" || key === "+" || key === "−" || key === "×" || key === "÷") {
    let result = current;
    if (state.stored !== null && state.op && !state.fresh) {
      result = apply(state.stored, current, state.op);
    } else if (state.stored !== null && state.op && state.fresh && key === "=") {
      result = state.stored;
    }
    if (Number.isNaN(result)) return { ...START, display: ERROR };
    if (key === "=") return { display: tidy(result), stored: null, op: null, fresh: true };
    // A second operator in a row just swaps the operator.
    const stored = state.stored !== null && state.fresh ? state.stored : result;
    return { display: tidy(stored), stored, op: key, fresh: true };
  }
  return state;
}

const KEYS: { key: string; label?: string; wide?: boolean; kind: "digit" | "op" | "action" | "equals" }[] = [
  { key: "Clear", kind: "action" },
  { key: "Back", kind: "action" },
  { key: "%", kind: "op", label: "Percent" },
  { key: "÷", kind: "op", label: "Divide" },
  { key: "7", kind: "digit" },
  { key: "8", kind: "digit" },
  { key: "9", kind: "digit" },
  { key: "×", kind: "op", label: "Multiply" },
  { key: "4", kind: "digit" },
  { key: "5", kind: "digit" },
  { key: "6", kind: "digit" },
  { key: "−", kind: "op", label: "Subtract" },
  { key: "1", kind: "digit" },
  { key: "2", kind: "digit" },
  { key: "3", kind: "digit" },
  { key: "+", kind: "op", label: "Add" },
  { key: "0", kind: "digit", wide: true },
  { key: ".", kind: "digit", label: "Decimal point" },
  { key: "=", kind: "equals", label: "Equals" },
];

const KEYBOARD: Record<string, string> = {
  "+": "+",
  "-": "−",
  "*": "×",
  x: "×",
  "/": "÷",
  "%": "%",
  "=": "=",
  Enter: "=",
  Backspace: "Back",
  Escape: "Clear",
  ".": ".",
};

export default function BillCalculator({ bills, today }: { bills: Bill[]; today: string }) {
  const [calc, setCalc] = useState<Calc>(START);
  const [ticked, setTicked] = useState<string[]>([]);

  const tap = useCallback((key: string) => setCalc((state) => press(state, key)), []);

  // A real keyboard works too, as long as the person is not typing in a field.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const key = /^\d$/.test(event.key) ? event.key : KEYBOARD[event.key];
      if (!key) return;
      event.preventDefault();
      tap(key);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tap]);

  const unpaid = useMemo(
    () => bills.filter((b) => !b.paidOn).sort((a, b) => a.due.localeCompare(b.due)),
    [bills],
  );
  const tickedTotal = sumCents(unpaid.filter((b) => ticked.includes(b.id)));

  const toggle = (id: string) =>
    setTicked((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));

  const sendTotal = () =>
    setCalc({ display: (tickedTotal / 100).toFixed(2), stored: null, op: null, fresh: true });

  const pending = calc.stored !== null && calc.op ? `${tidy(calc.stored)} ${calc.op}` : "";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section aria-labelledby="calculator" className="card p-4 sm:p-6">
        <h2 id="calculator" className={SECTION_TITLE}>
          Calculator
        </h2>

        <div className="mt-4 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-solid)] px-4 py-3 text-right">
          <p className="min-h-5 text-[14px] leading-none text-[var(--text-secondary)]">{pending}</p>
          <p
            className="mt-1 overflow-x-auto whitespace-nowrap text-[34px] font-bold leading-tight text-[var(--text-primary)]"
            role="status"
            aria-live="polite"
            aria-label={`Display: ${calc.display}`}
          >
            {calc.display}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          {KEYS.map(({ key, label, wide, kind }) => (
            <button
              key={key}
              type="button"
              onClick={() => tap(key)}
              aria-label={label}
              className={`min-h-14 rounded-2xl border text-[22px] font-semibold transition-colors cursor-pointer ${wide ? "col-span-2" : ""} ${
                kind === "equals"
                  ? "border-transparent text-[var(--on-accent)]"
                  : kind === "op"
                    ? "border-[var(--primary)] text-[var(--text-primary)] hover:bg-[color-mix(in_srgb,var(--primary)_12%,transparent)]"
                    : kind === "action"
                      ? "border-[var(--border-color)] text-[17px] text-[var(--text-primary)] hover:border-[var(--primary)]"
                      : "border-[var(--border-color)] bg-[var(--surface-solid)] text-[var(--text-primary)] hover:border-[var(--primary)]"
              }`}
              style={kind === "equals" ? { background: "var(--btn-primary-bg)" } : undefined}
            >
              {key}
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="add-up-bills" className="card p-4 sm:p-6">
        <h2 id="add-up-bills" className={SECTION_TITLE}>
          Add up your bills
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-[var(--text-secondary)]">
          Tick the unpaid bills you want to add up, then send the total to the calculator.
        </p>

        {unpaid.length === 0 ? (
          <p className="mt-4 text-[16px] text-[var(--text-secondary)]">You have no unpaid bills.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {unpaid.map((bill) => {
              const on = ticked.includes(bill.id);
              return (
                <li key={bill.id}>
                  <label
                    className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border px-4 py-2 transition-colors ${
                      on
                        ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_12%,transparent)]"
                        : "border-[var(--border-color)] hover:border-[var(--primary)]"
                    }`}
                  >
                    <input type="checkbox" checked={on} onChange={() => toggle(bill.id)} className="h-6 w-6 shrink-0 accent-[var(--accent-2)]" />
                    <span className="min-w-0 grow">
                      <span className="block break-words text-[16px] font-semibold leading-snug text-[var(--text-primary)]">{bill.name}</span>
                      <span className="block text-[14px] leading-snug text-[var(--text-secondary)]">Due {formatDate(bill.due)}</span>
                    </span>
                    <span className="shrink-0 text-[16px] font-bold text-[var(--text-primary)]">{formatCents(bill.cents)}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}

        <p className="mt-5 flex items-baseline justify-between gap-4 text-[var(--text-primary)]">
          <span className="text-[16px] font-semibold">Ticked bills total</span>
          <span className="text-[22px] font-bold">{formatCents(tickedTotal)}</span>
        </p>
        <button type="button" onClick={sendTotal} className="btn-secondary mt-4 w-full">
          Use this total
        </button>
        <p className="sr-only">Today is {formatDate(today, true)}.</p>
      </section>
    </div>
  );
}
