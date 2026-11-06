"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  BILL_CATEGORIES,
  BILL_NAME_MAX,
  SOON_DAYS,
  billStatus,
  formatCents,
  formatDate,
  fromIso,
  newBillId,
  parseCents,
  statusLabel,
  sumCents,
  toIso,
  type Bill,
  type BillCategory,
} from "@/lib/bills";
import { FIELD, LABEL, SECTION_TITLE } from "./styles";

/** My bills: what is due, a form to add one, a month calendar and the list. */
export default function BillsTab({
  bills,
  today,
  onAdd,
  onPaid,
  onDelete,
}: {
  bills: Bill[];
  today: string;
  onAdd: (bill: Bill) => void;
  onPaid: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const unpaid = useMemo(
    () => bills.filter((b) => !b.paidOn).sort((a, b) => a.due.localeCompare(b.due)),
    [bills],
  );
  const overdue = unpaid.filter((b) => billStatus(b, today) === "overdue");
  const dueSoon = unpaid.filter((b) => {
    const status = billStatus(b, today);
    return status === "today" || status === "soon";
  });

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const shown = selectedDay ? bills.filter((b) => b.due === selectedDay) : unpaid;

  return (
    <div className="flex flex-col gap-8">
      {/* Reminder */}
      <p
        role="status"
        className={`rounded-2xl border p-4 text-center text-[17px] font-semibold text-[var(--text-primary)] ${
          overdue.length > 0 ? "border-[var(--primary)]" : "border-[var(--border-color)]"
        }`}
      >
        {overdue.length > 0
          ? `${overdue.length} ${overdue.length === 1 ? "bill is" : "bills are"} overdue.`
          : dueSoon.length > 0
            ? `${dueSoon.length} ${dueSoon.length === 1 ? "bill is" : "bills are"} due in the next ${SOON_DAYS} days.`
            : "All caught up. Nothing is due in the next 7 days."}
      </p>

      {/* Summary */}
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Due this week" value={String(dueSoon.length)} />
        <Stat label="Overdue" value={String(overdue.length)} />
        <Stat label="Total owing" value={formatCents(sumCents(unpaid))} wide />
      </dl>

      <AddBillForm today={today} onAdd={onAdd} />

      <BillCalendar bills={bills} today={today} selectedDay={selectedDay} onSelect={setSelectedDay} />

      {/* The list */}
      <section aria-labelledby="bill-list">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="bill-list" className={SECTION_TITLE}>
            {selectedDay ? `Due ${formatDate(selectedDay)}` : "Bills to pay"}
          </h2>
          {selectedDay && (
            <button type="button" onClick={() => setSelectedDay(null)} className="btn-ghost min-h-11">
              Show all bills
            </button>
          )}
        </div>

        {shown.length === 0 ? (
          <p className="mt-4 text-[16px] leading-relaxed text-[var(--text-secondary)]">
            {selectedDay
              ? "Nothing is due on that day."
              : bills.length === 0
                ? "No bills yet. Use the form above to add your first one."
                : "Nothing left to pay. Paid bills are under Paid history."}
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {shown.map((bill) => (
              <BillRow key={bill.id} bill={bill} today={today} onPaid={onPaid} onDelete={onDelete} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/** One figure. `wide` takes the full row on a phone, so a dollar amount never wraps. */
function Stat({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`card flex flex-col-reverse items-center justify-end gap-1 px-2 py-4 text-center ${wide ? "col-span-2 sm:col-span-1" : ""}`}>
      <dt className="text-[14px] font-semibold leading-tight text-[var(--text-secondary)]">{label}</dt>
      <dd className="whitespace-nowrap text-[26px] font-bold leading-tight text-[var(--text-primary)]">{value}</dd>
    </div>
  );
}

function AddBillForm({ today, onAdd }: { today: string; onAdd: (bill: Bill) => void }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [due, setDue] = useState(today);
  const [category, setCategory] = useState<BillCategory>("Electricity");
  const [error, setError] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    const cents = parseCents(amount);
    if (!trimmed) return setError("Give the bill a name, such as Electricity.");
    if (cents === null) return setError("Enter the amount in dollars, for example 120 or 120.50.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(due)) return setError("Choose the date the bill is due.");
    onAdd({ id: newBillId(), name: trimmed.slice(0, BILL_NAME_MAX), cents, due, category });
    setName("");
    setAmount("");
    setError("");
  };

  return (
    <section aria-labelledby="add-bill" className="card p-4 sm:p-6">
      <h2 id="add-bill" className={SECTION_TITLE}>
        Add a bill
      </h2>
      <form onSubmit={submit} noValidate className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="bill-name" className={LABEL}>
            Bill name
          </label>
          <input
            id="bill-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={BILL_NAME_MAX}
            autoComplete="off"
            className={FIELD}
          />
        </div>
        <div>
          <label htmlFor="bill-amount" className={LABEL}>
            Amount in dollars
          </label>
          <input
            id="bill-amount"
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            autoComplete="off"
            placeholder="0.00"
            className={FIELD}
          />
        </div>
        <div>
          <label htmlFor="bill-due" className={LABEL}>
            Due date
          </label>
          <input id="bill-due" type="date" value={due} onChange={(event) => setDue(event.target.value)} className={FIELD} />
        </div>
        <div>
          <label htmlFor="bill-category" className={LABEL}>
            Category
          </label>
          <select
            id="bill-category"
            value={category}
            onChange={(event) => setCategory(event.target.value as BillCategory)}
            className={FIELD}
          >
            {BILL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          {error && (
            <p role="alert" className="mb-3 text-[15px] font-semibold text-[var(--text-primary)]">
              {error}
            </p>
          )}
          <button type="submit" className="btn-primary w-full sm:w-auto">
            Add bill
          </button>
        </div>
      </form>
    </section>
  );
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** A month at a glance. Each day with a bill carries a symbol, not just a colour. */
function BillCalendar({
  bills,
  today,
  selectedDay,
  onSelect,
}: {
  bills: Bill[];
  today: string;
  selectedDay: string | null;
  onSelect: (day: string | null) => void;
}) {
  // The first day of the month on show.
  const [monthStart, setMonthStart] = useState(() => `${today.slice(0, 7)}-01`);

  const first = fromIso(monthStart);
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const leading = (first.getDay() + 6) % 7; // Monday first
  const title = first.toLocaleDateString("en-AU", { month: "long", year: "numeric" });

  const shift = (months: number) => {
    const next = new Date(first.getFullYear(), first.getMonth() + months, 1, 12);
    setMonthStart(toIso(next));
  };

  const byDay = useMemo(() => {
    const map = new Map<string, Bill[]>();
    for (const bill of bills) map.set(bill.due, [...(map.get(bill.due) ?? []), bill]);
    return map;
  }, [bills]);

  const cells: (string | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => `${monthStart.slice(0, 8)}${String(i + 1).padStart(2, "0")}`),
  ];

  return (
    <section aria-labelledby="bill-calendar" className="card p-3 sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <button type="button" onClick={() => shift(-1)} className="btn-ghost min-h-11" aria-label="Previous month">
          Earlier
        </button>
        <h2 id="bill-calendar" className="text-center text-[20px] font-bold leading-none text-[var(--text-primary)]">
          {title}
        </h2>
        <button type="button" onClick={() => shift(1)} className="btn-ghost min-h-11" aria-label="Next month">
          Later
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-0.5 text-center">
        {WEEKDAYS.map((day) => (
          <div key={day} className="pb-1 text-[13px] font-semibold text-[var(--text-secondary)]">
            {day}
          </div>
        ))}
        {cells.map((day, index) => {
          if (!day) return <div key={`blank-${index}`} />;
          const due = byDay.get(day) ?? [];
          const statuses = due.map((b) => billStatus(b, today));
          const mark = statuses.includes("overdue")
            ? { symbol: "!", word: "overdue" }
            : statuses.some((s) => s !== "paid")
              ? { symbol: "•", word: "due" }
              : due.length > 0
                ? { symbol: "✓", word: "paid" }
                : null;
          const isToday = day === today;
          const isSelected = day === selectedDay;
          const number = Number(day.slice(8));
          const label = `${fromIso(day).toLocaleDateString("en-AU", { day: "numeric", month: "long" })}${
            due.length > 0 ? `, ${due.length} ${due.length === 1 ? "bill" : "bills"}, ${mark?.word}` : ""
          }${isToday ? ", today" : ""}`;
          const box = `flex min-h-11 w-full flex-col items-center justify-center rounded-xl border text-[15px] leading-none ${
            isSelected
              ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] font-bold text-[var(--text-primary)]"
              : isToday
                ? "border-[var(--text-secondary)] font-bold text-[var(--text-primary)]"
                : "border-transparent text-[var(--text-primary)]"
          }`;
          return (
            <div key={day}>
              {due.length > 0 ? (
                <button
                  type="button"
                  onClick={() => onSelect(isSelected ? null : day)}
                  aria-pressed={isSelected}
                  aria-label={label}
                  className={`${box} cursor-pointer hover:border-[var(--primary)]`}
                >
                  <span aria-hidden="true">{number}</span>
                  <span aria-hidden="true" className="mt-0.5 text-[14px] font-bold leading-none text-[var(--primary)]">
                    {mark?.symbol}
                  </span>
                </button>
              ) : (
                <div className={box}>
                  {number}
                  {isToday && <span className="sr-only">, today</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-1 text-[14px] text-[var(--text-secondary)]">
        <span>
          <span className="font-bold text-[var(--primary)]">!</span> Overdue
        </span>
        <span>
          <span className="font-bold text-[var(--primary)]">•</span> Due
        </span>
        <span>
          <span className="font-bold text-[var(--primary)]">✓</span> Paid
        </span>
      </p>
    </section>
  );
}

function BillRow({
  bill,
  today,
  onPaid,
  onDelete,
}: {
  bill: Bill;
  today: string;
  onPaid: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const status = billStatus(bill, today);

  return (
    <li className="card p-4">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <p className="break-words text-[18px] font-semibold leading-snug text-[var(--text-primary)]">{bill.name}</p>
          <p className="text-[14px] leading-snug text-[var(--text-secondary)]">
            {bill.category} · Due {formatDate(bill.due, true)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[20px] font-bold leading-snug text-[var(--text-primary)]">{formatCents(bill.cents)}</p>
          <p
            className={`inline-block rounded-full border px-2.5 py-1 text-[13px] font-semibold leading-none text-[var(--text-primary)] ${
              status === "overdue" ? "border-[var(--primary)]" : "border-[var(--border-color)]"
            }`}
          >
            {status === "overdue" ? "! " : ""}
            {statusLabel(bill, today)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {!bill.paidOn && (
          <button type="button" onClick={() => onPaid(bill.id)} className="btn-primary min-h-11 py-2">
            Mark as paid
          </button>
        )}
        {confirming ? (
          <>
            <button type="button" onClick={() => onDelete(bill.id)} className="btn-secondary min-h-11 py-2">
              Yes, delete it
            </button>
            <button type="button" onClick={() => setConfirming(false)} className="btn-ghost min-h-11">
              Keep it
            </button>
          </>
        ) : (
          <button type="button" onClick={() => setConfirming(true)} className="btn-ghost min-h-11">
            Delete
          </button>
        )}
      </div>
    </li>
  );
}
