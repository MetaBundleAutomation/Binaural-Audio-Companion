import Link from "next/link";
import type { Metadata } from "next";
import NavIcon from "@/components/NavIcons";
import { CRISIS_LINES } from "@/lib/nav";

export const metadata: Metadata = {
  title: "Need to talk to someone now? — CRUX",
  description: "Calm, immediate support lines for veterans and anyone struggling right now.",
};

// A calm, one-tap crisis page for the wheel. The Australian lines are the ones
// CRUX already uses. Other countries and any new numbers are marked for the
// doctor to verify before launch — no number is invented here.
const MORE_COUNTRIES = [
  {
    country: "United States",
    lines: [
      { name: "Veterans Crisis Line", detail: "dial 988, then press 1" },
      { name: "Emergency", detail: "911" },
    ],
  },
  {
    country: "United Kingdom",
    lines: [
      { name: "Samaritans", detail: "116 123" },
      { name: "Combat Stress", detail: "0800 138 1619" },
      { name: "Emergency", detail: "999" },
    ],
  },
];

export default function CrisisPage() {
  return (
    <main className="min-h-screen px-5 pt-12 pb-20 md:pt-16">
      <div className="max-w-xl mx-auto">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          <NavIcon name="arrow" className="h-4 w-4 rotate-180" />
          Back
        </Link>

        <div className="mt-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
            You&apos;re not alone
          </h1>
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-[var(--text-secondary)]">
            If things feel heavy right now, reaching out is a strong thing to do.
            These lines are free and open to you.
          </p>
        </div>

        {/* Australia — confirmed lines CRUX already uses. */}
        <div className="card mt-10 p-6 sm:p-7">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
            Australia
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {CRISIS_LINES.map(line => (
              <li key={line.tel}>
                <a
                  href={`tel:${line.tel}`}
                  className="flex items-center justify-between rounded-xl border px-4 py-3 transition-colors hover:bg-white/5"
                  style={{ borderColor: "var(--border-color)" }}
                >
                  <span className="font-semibold text-[var(--text-primary)]">{line.name}</span>
                  <span className="text-[var(--primary)]">{line.number}</span>
                </a>
              </li>
            ))}
            <li>
              <a
                href="tel:000"
                className="flex items-center justify-between rounded-xl border px-4 py-3 transition-colors hover:bg-white/5"
                style={{ borderColor: "var(--border-color)" }}
              >
                <span className="font-semibold text-[var(--text-primary)]">Emergency</span>
                <span className="text-[var(--primary)]">000</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Other countries — listed for the doctor to confirm before launch. */}
        <div className="card mt-6 p-6 sm:p-7">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
            Other countries
          </h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Draft list — verify every number before launch.
          </p>
          <div className="mt-4 flex flex-col gap-5">
            {MORE_COUNTRIES.map(group => (
              <div key={group.country}>
                <h3 className="font-semibold text-[var(--text-primary)]">{group.country}</h3>
                <ul className="mt-2 flex flex-col gap-1 text-[var(--text-secondary)]">
                  {group.lines.map(line => (
                    <li key={line.name} className="flex justify-between gap-4">
                      <span>{line.name}</span>
                      <span className="text-right">{line.detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
