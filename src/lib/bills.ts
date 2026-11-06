/**
 * Bill Toolkit: data and date helpers.
 *
 * Bills are kept on the person's own device (`crux:bills`) and nowhere else.
 * There is no bank connection and nothing is sent anywhere.
 *
 * Money is stored in cents as whole numbers, so adding bills up never picks up
 * a rounding error. Dates are plain `YYYY-MM-DD` strings in the person's own
 * time zone, which sort and compare correctly as text.
 */

export const BILL_CATEGORIES = [
  "Electricity",
  "Gas",
  "Water",
  "Rates",
  "Phone and internet",
  "Rent or mortgage",
  "Insurance",
  "Subscription",
  "Medical",
  "Other",
] as const;

export type BillCategory = (typeof BILL_CATEGORIES)[number];

export interface Bill {
  id: string;
  name: string;
  /** Whole cents. */
  cents: number;
  /** YYYY-MM-DD. */
  due: string;
  category: BillCategory;
  /** YYYY-MM-DD, once it has been paid. */
  paidOn?: string;
}

const STORAGE_KEY = "crux:bills";
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
export const BILL_NAME_MAX = 60;
/** A sanity cap on one bill: ten million dollars. */
const CENTS_MAX = 1_000_000_000;

function isBill(value: unknown): value is Bill {
  if (typeof value !== "object" || value === null) return false;
  const b = value as Record<string, unknown>;
  return (
    typeof b.id === "string" &&
    typeof b.name === "string" &&
    b.name.length > 0 &&
    typeof b.cents === "number" &&
    Number.isInteger(b.cents) &&
    b.cents >= 0 &&
    b.cents <= CENTS_MAX &&
    typeof b.due === "string" &&
    ISO_DATE.test(b.due) &&
    typeof b.category === "string" &&
    (BILL_CATEGORIES as readonly string[]).includes(b.category) &&
    (b.paidOn === undefined || (typeof b.paidOn === "string" && ISO_DATE.test(b.paidOn)))
  );
}

export function loadBills(): Bill[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data: unknown = JSON.parse(raw);
    return Array.isArray(data) ? data.filter(isBill).slice(0, 2000) : [];
  } catch {
    return [];
  }
}

/** Returns false when the device would not save (private window, full storage). */
export function saveBills(bills: Bill[]): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
    return true;
  } catch {
    return false;
  }
}

export function newBillId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `bill-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }
}

// ── Money ────────────────────────────────────────────────────────────────────

const AUD = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" });

export function formatCents(cents: number): string {
  return AUD.format(cents / 100);
}

/** "$1,234.5" → 123450. Null when it is not an amount of money. */
export function parseCents(input: string): number | null {
  const cleaned = input.replace(/[$,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const cents = Math.round(parseFloat(cleaned) * 100);
  return cents > 0 && cents <= CENTS_MAX ? cents : null;
}

// ── Dates ────────────────────────────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(2, "0");

export function toIso(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayIso(): string {
  return toIso(new Date());
}

/** A local Date at midday, so daylight-saving changes never shift the day. */
export function fromIso(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}

export function addDays(iso: string, days: number): string {
  const date = fromIso(iso);
  date.setDate(date.getDate() + days);
  return toIso(date);
}

export function daysBetween(fromIsoDate: string, toIsoDate: string): number {
  return Math.round((fromIso(toIsoDate).getTime() - fromIso(fromIsoDate).getTime()) / 86_400_000);
}

export function formatDate(iso: string, withYear = false): string {
  return fromIso(iso).toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
  });
}

/** The Australian financial year (1 July to 30 June) that contains `iso`, shifted by `offset` years. */
export function financialYear(iso: string, offset = 0): { from: string; to: string; label: string } {
  const date = fromIso(iso);
  const startYear = (date.getMonth() >= 6 ? date.getFullYear() : date.getFullYear() - 1) + offset;
  return {
    from: `${startYear}-07-01`,
    to: `${startYear + 1}-06-30`,
    label: `${startYear} to ${startYear + 1}`,
  };
}

// ── Status ───────────────────────────────────────────────────────────────────

export type BillStatus = "paid" | "overdue" | "today" | "soon" | "later";

/** How many days ahead counts as "due soon". */
export const SOON_DAYS = 7;

export function billStatus(bill: Bill, today: string): BillStatus {
  if (bill.paidOn) return "paid";
  if (bill.due < today) return "overdue";
  if (bill.due === today) return "today";
  return daysBetween(today, bill.due) <= SOON_DAYS ? "soon" : "later";
}

export function statusLabel(bill: Bill, today: string): string {
  const status = billStatus(bill, today);
  if (status === "paid") return `Paid ${formatDate(bill.paidOn ?? today)}`;
  if (status === "today") return "Due today";
  const days = Math.abs(daysBetween(today, bill.due));
  const unit = days === 1 ? "day" : "days";
  return status === "overdue" ? `Overdue by ${days} ${unit}` : `Due in ${days} ${unit}`;
}

export function sumCents(bills: Bill[]): number {
  return bills.reduce((total, bill) => total + bill.cents, 0);
}
