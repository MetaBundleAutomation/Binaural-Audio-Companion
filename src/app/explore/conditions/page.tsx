import Link from "next/link";
import type { Metadata } from "next";
import NavIcon from "@/components/NavIcons";
import { WHEEL_LABEL, WHEEL_DRAFT_NOTICE } from "@/lib/wheel";
import {
  CONDITIONS,
  CONDITIONS_SOURCE_APP,
  CONDITIONS_SNAPSHOT,
} from "@/lib/conditions";

export const metadata: Metadata = {
  title: `Conditions — ${WHEEL_LABEL} — CRUX`,
  description:
    "Plain-language and clinical information on the conditions veterans and first responders commonly carry. A draft for doctor review.",
};

// The Conditions index. A separate area reached from the wheel, not a spoke on
// the ring: the ring is lifestyle approaches, this is diagnoses. The content is
// a point-in-time copy of the Community Treatment Platform, shown DRAFT.

export default function ConditionsIndexPage() {
  return (
    <main className="min-h-screen px-5 pt-12 pb-20 md:pt-16">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          <NavIcon name="arrow" className="h-4 w-4 rotate-180" />
          Back to the wheel
        </Link>

        <div className="mt-8 text-center">
          <span className="eyebrow">{WHEEL_DRAFT_NOTICE}</span>
          <h1 className="mt-6 text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
            Conditions
          </h1>
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-[var(--text-secondary)]">
            For veterans and first responders. Each page has a plain-language
            version and a clinician version — tap to switch.
          </p>
        </div>

        {/* Provenance: this is a copy, and it is not reviewed. */}
        <div
          className="mt-8 rounded-xl border px-4 py-3 text-sm text-[var(--text-secondary)]"
          style={{ borderColor: "var(--border-color)", background: "var(--background-light)" }}
        >
          Copied from Les&apos;s {CONDITIONS_SOURCE_APP} on {CONDITIONS_SNAPSHOT} for
          this mock-up. It is not yet clinically reviewed, and later edits there
          will not appear here on their own.
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {CONDITIONS.map((condition) => (
            <li key={condition.slug}>
              <Link
                href={`/explore/conditions/${condition.slug}`}
                className="card flex h-full flex-col p-5 transition-transform duration-300 motion-safe:hover:scale-[1.02]"
              >
                <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
                  {condition.name}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {condition.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-col items-center gap-4 text-center">
          <Link href="/crisis" className="btn-secondary">
            Need to talk to someone now?
          </Link>
        </div>
      </div>
    </main>
  );
}
