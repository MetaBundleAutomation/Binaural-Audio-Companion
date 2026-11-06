"use client";

import { useCallback, useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { loadBills, saveBills, todayIso, type Bill } from "@/lib/bills";
import BillCalculator from "./BillCalculator";
import BillsTab from "./BillsTab";
import HistoryTab from "./HistoryTab";
import UnitConverter from "./UnitConverter";
import { pill } from "./styles";

/**
 * Bill Toolkit: a large-print list of household bills, a calendar of what is
 * due, a record of what has been paid, a calculator and a unit converter.
 *
 * Everything is kept on this device. There are no accounts, no bank
 * connections and nothing is sent anywhere. Usage events record that a bill
 * was added or paid, never its name or amount.
 */

type Tab = "bills" | "history" | "calculator" | "converter";

const TABS: { id: Tab; label: string }[] = [
  { id: "bills", label: "My bills" },
  { id: "history", label: "Paid history" },
  { id: "calculator", label: "Calculator" },
  { id: "converter", label: "Converter" },
];

export default function BillToolkit() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [today, setToday] = useState("");
  const [ready, setReady] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [tab, setTab] = useState<Tab>("bills");

  useEffect(() => {
    setBills(loadBills());
    setToday(todayIso());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) setSaveFailed(!saveBills(bills));
  }, [bills, ready]);

  const add = useCallback((bill: Bill) => {
    setBills((all) => [...all, bill]);
    trackEvent("bills_add");
  }, []);

  const markPaid = useCallback((id: string) => {
    setBills((all) => all.map((b) => (b.id === id ? { ...b, paidOn: todayIso() } : b)));
    trackEvent("bills_paid");
  }, []);

  const markUnpaid = useCallback((id: string) => {
    setBills((all) => all.map((b) => (b.id === id ? { ...b, paidOn: undefined } : b)));
  }, []);

  const remove = useCallback((id: string) => {
    setBills((all) => all.filter((b) => b.id !== id));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-10 sm:px-5 md:pt-14">
      <div className="no-print text-center">
        <span className="eyebrow">Bill toolkit</span>
        <h1 className="mt-5 text-balance text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl md:text-5xl">
          Stay on top of your bills
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-[16px] leading-relaxed text-[var(--text-secondary)]">
          Add a bill, see what is due, and tick it off when it is paid. Everything stays on this
          device. Nothing is sent anywhere.
        </p>
      </div>

      <div className="no-print mt-8 flex justify-center">
        <div role="group" aria-label="Bill Toolkit sections" className="flex flex-wrap justify-center gap-2">
          {TABS.map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)} aria-pressed={tab === t.id} className={pill(tab === t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {saveFailed && (
        <p role="alert" className="no-print mt-6 rounded-2xl border border-[var(--primary)] p-4 text-[15px] leading-relaxed text-[var(--text-primary)]">
          This device is not saving your bills, so they will be gone when you close the page. This
          happens in a private window or when storage is full.
        </p>
      )}

      <div className="mt-8">
        {!ready ? (
          <p className="text-center text-[16px] text-[var(--text-secondary)]">Loading your bills…</p>
        ) : tab === "bills" ? (
          <BillsTab bills={bills} today={today} onAdd={add} onPaid={markPaid} onDelete={remove} />
        ) : tab === "history" ? (
          <HistoryTab bills={bills} today={today} onUnpaid={markUnpaid} />
        ) : tab === "calculator" ? (
          <BillCalculator bills={bills} today={today} />
        ) : (
          <UnitConverter />
        )}
      </div>
    </div>
  );
}
