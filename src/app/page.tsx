import LaunchRedirect from "@/components/LaunchRedirect";
import NavIcon from "@/components/NavIcons";
import { NAV_GROUPS } from "@/lib/nav";

// The home grid shows every tool, learning and community link; "More" (About,
// Settings) lives in the sidebar only.
const HOME_GRID_GROUPS = new Set(["Tools", "Learn", "Community"]);
const HOME_GRID_ITEMS = NAV_GROUPS
  .filter(group => HOME_GRID_GROUPS.has(group.title))
  .flatMap(group => group.items);

export default function Home() {
  return (
    <main className="min-h-screen">
      <LaunchRedirect />

      {/* Hero Section */}
      <section id="hero" className="pt-14 pb-10 md:pt-20 md:pb-14 px-5 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="eyebrow">Free · No accounts · Made for veterans</span>
          <h1 className="mt-6 text-balance text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-[var(--text-primary)] leading-[1.05]">
            Always remember to be{" "}
            <span className="text-brand-gradient">kind to yourself</span>.
          </h1>
          <p className="mt-6 text-pretty text-lg md:text-xl leading-relaxed text-[var(--text-secondary)]">
            Audio sessions and guided meditations to help you feel calmer, focus more clearly throughout your day, or ease into sleep.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="/binaural" className="btn-primary">
              Start listening
              <NavIcon name="arrow" className="h-4 w-4" />
            </a>
            <a href="/brain" className="btn-secondary">
              What&apos;s the loop?
            </a>
          </div>
        </div>
      </section>

      {/* Tool grid — one card per tool, learning and community link */}
      <section aria-label="Tools" className="max-w-[1400px] mx-auto px-5 pb-10 md:pb-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {HOME_GRID_ITEMS.map(item => (
            <a key={item.href} href={item.href} className="card card-hover flex flex-col p-6">
              <span
                className="grid h-11 w-11 place-items-center rounded-xl text-white shadow-lg"
                style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
                aria-hidden="true"
              >
                <NavIcon name={item.icon} className="h-5 w-5" />
              </span>
              <span className="mt-4 text-[17px] font-semibold text-[var(--text-primary)]">
                {item.label}
              </span>
              {item.tagline && (
                <span className="mt-1 grow text-[14px] leading-relaxed text-[var(--text-secondary)]">
                  {item.tagline}
                </span>
              )}
              <span className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--text-primary)]">
                Open
                <NavIcon name="arrow" className="h-4 w-4 text-[var(--accent-2)]" />
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* Closing affirmation — a quiet bookend to the greeting at the top */}
      <p className="text-center text-base font-light italic text-[var(--text-secondary)] max-w-[600px] mx-auto px-4 pb-20 pt-4 text-balance">
        You&apos;re right where you&apos;re supposed to be.
      </p>
    </main>
  );
}
