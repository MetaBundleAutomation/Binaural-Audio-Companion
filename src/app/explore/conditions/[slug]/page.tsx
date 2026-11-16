import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import NavIcon from "@/components/NavIcons";
import ConditionView from "@/components/ConditionView";
import { WHEEL_LABEL, WHEEL_DRAFT_NOTICE } from "@/lib/wheel";
import {
  CONDITIONS,
  CONDITIONS_SOURCE_APP,
  CONDITIONS_SNAPSHOT,
  getCondition,
} from "@/lib/conditions";

// One page per condition, under /explore/conditions/<slug>. Server component for
// the shell (back link, draft + provenance notices, heading, switcher pills,
// crisis link); the audience toggle and content live in <ConditionView>.

export function generateStaticParams() {
  return CONDITIONS.map((condition) => ({ slug: condition.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const condition = getCondition(slug);
  if (!condition) return { title: `Conditions — ${WHEEL_LABEL} — CRUX` };
  return {
    title: `${condition.name} — Conditions — CRUX`,
    description: condition.description,
  };
}

export default async function ConditionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const condition = getCondition(slug);
  if (!condition) notFound();

  return (
    <main className="min-h-screen px-5 pt-12 pb-20 md:pt-16">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/explore/conditions"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          <NavIcon name="arrow" className="h-4 w-4 rotate-180" />
          All conditions
        </Link>

        <div className="mt-8">
          <span className="eyebrow">{WHEEL_DRAFT_NOTICE}</span>
          <h1 className="mt-5 text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
            {condition.name}
          </h1>
          {condition.lastReviewed ? (
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Last clinically reviewed: {condition.lastReviewed}
            </p>
          ) : (
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Copied from {CONDITIONS_SOURCE_APP} on {CONDITIONS_SNAPSHOT}. Not yet
              clinically reviewed.
            </p>
          )}
        </div>

        {/* Condition-switcher pills, from the shared list. */}
        <nav aria-label="All conditions" className="mt-6 flex flex-wrap gap-2">
          {CONDITIONS.map((c) => {
            const isCurrent = c.slug === condition.slug;
            return isCurrent ? (
              <span
                key={c.slug}
                aria-current="page"
                className="rounded-full border px-3 py-1.5 text-sm font-semibold text-[var(--text-primary)]"
                style={{ borderColor: "var(--primary)", background: "var(--background-light)" }}
              >
                {c.name}
              </span>
            ) : (
              <Link
                key={c.slug}
                href={`/explore/conditions/${c.slug}`}
                className="rounded-full border px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--primary)] hover:text-[var(--text-primary)]"
                style={{ borderColor: "var(--border-color)" }}
              >
                {c.name}
              </Link>
            );
          })}
        </nav>

        <ConditionView condition={condition} />

        <div className="mt-12 flex flex-col items-center gap-4 text-center">
          <Link href="/crisis" className="btn-secondary">
            Need to talk to someone now?
          </Link>
        </div>
      </div>
    </main>
  );
}
