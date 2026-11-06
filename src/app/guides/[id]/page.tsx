import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FeatureRow } from "@/components/FeatureTile";
import NavIcon from "@/components/NavIcons";
import { siteName } from "@/config";
import { COLLECTIONS, findCollection } from "@/lib/collections";
import { SHELVES, findFeature, type Feature } from "@/lib/library";

// One page per collection in `src/lib/collections.ts`, built ahead of time.
export const dynamicParams = false;

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const collection = findCollection(id);
  if (!collection) return {};
  return {
    title: `${collection.title} | ${siteName}`,
    description: collection.intro,
    // Drafts stay out of search results until a clinician has signed them off.
    ...(collection.status === "in-review" ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function CollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const collection = findCollection(id);
  if (!collection) notFound();

  const feature = findFeature(collection.featureId);
  const shelf = SHELVES.find((s) => s.id === feature?.shelf);
  const related = collection.related
    .map((featureId) => findFeature(featureId))
    .filter((f): f is Feature => f !== undefined);
  const draft = collection.status === "in-review";

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 pb-16 pt-10 sm:px-5 md:pt-14">
      <div className="text-center">
        <span className="eyebrow">{shelf?.title ?? "Library"}</span>
        <h1 className="mt-5 text-balance text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl md:text-5xl">
          {collection.title}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-[16px] font-semibold leading-relaxed text-[var(--text-primary)]">
          {collection.audience}
        </p>
        <p className="mx-auto mt-2 max-w-xl text-pretty text-[16px] leading-relaxed text-[var(--text-secondary)]">
          {collection.intro}
        </p>
      </div>

      {draft && (
        <p className="mt-8 rounded-2xl border border-[var(--primary)] p-4 text-[15px] leading-relaxed text-[var(--text-primary)]">
          <strong>Draft.</strong> A doctor has not finished checking these guides. Read them as
          background, and take any question about your own care to your doctor.
        </p>
      )}

      <p className={`${draft ? "mt-4" : "mt-8"} rounded-2xl border border-[var(--border-color)] p-4 text-[15px] leading-relaxed text-[var(--text-secondary)]`}>
        These guides still live on the {collection.sourceName} site. Each link below opens there in
        a new tab. They will move into this app as they are reviewed.
      </p>

      <div className="mt-8 flex flex-col gap-8">
        {collection.groups.map((group) => (
          <section key={group.title} aria-label={group.title}>
            <h2 className="text-[22px] font-bold leading-none text-[var(--text-primary)]">{group.title}</h2>
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {group.sections.map((section) => (
                <li key={section.href}>
                  <a
                    href={section.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card card-hover flex h-full items-center gap-4 p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                  >
                    <span className="min-w-0 grow">
                      <span className="block text-[16px] font-semibold leading-snug text-[var(--text-primary)]">
                        {section.title}
                      </span>
                      <span className="block text-[14px] leading-snug text-[var(--text-secondary)]">
                        {section.blurb}
                      </span>
                    </span>
                    <NavIcon name="external" className="h-4 w-4 shrink-0 text-[var(--accent-2)]" />
                    <span className="sr-only">Opens the {collection.sourceName} site in a new tab</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {related.length > 0 && (
          <section aria-label="Tools in this app">
            <h2 className="text-[22px] font-bold leading-none text-[var(--text-primary)]">Tools in this app</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {related.map((f) => (
                <FeatureRow key={f.id} feature={f} from="guides" />
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="mt-10 flex flex-col items-center gap-3 text-center">
        <p className="text-[14px] leading-relaxed text-[var(--text-secondary)]">
          This is information, not advice for your situation.
        </p>
        <Link href="/help" className="btn-ghost min-h-11">
          <NavIcon name="phone" className="h-4 w-4" />
          If things are bad right now
        </Link>
      </div>
    </main>
  );
}
