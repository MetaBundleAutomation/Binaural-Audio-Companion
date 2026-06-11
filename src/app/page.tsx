import Player from "@/components/Player";
import LaunchScrollHandler from "@/components/LaunchScrollHandler";

export default function Home() {
  return (
    <main className="min-h-screen">
      <LaunchScrollHandler />

      {/* Hero Section */}
      <section id="hero" className="text-center py-20 px-4">
        <h1 className="text-2xl md:text-3xl font-medium text-[var(--text-primary)] max-w-[600px] mx-auto leading-snug tracking-tight text-balance">
          Always remember to be kind to yourself.
        </h1>
        <p className="mt-5 text-sm md:text-base text-[var(--text-secondary)] max-w-[600px] mx-auto font-medium leading-relaxed text-balance">
          Simple audio sessions to help you feel calmer, focus more clearly, or ease into sleep.
        </p>

        {/* Feature chips — tap to jump straight to a section */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {([
            { label: "Binaural Beats", href: "#player"        },
            { label: "Noise Therapy",  href: "#noise"         },
            { label: "Box Breathing",  href: "#box-breathing" },
          ] as const).map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold text-[var(--text-secondary)] bg-[var(--background-light)] border border-[var(--border-color)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] shrink-0" aria-hidden="true" />
              {label}
            </a>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="mt-10 flex justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 opacity-60 animate-bounce"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-5">
        <Player />
      </div>

      {/* Closing affirmation — a quiet bookend to the greeting at the top */}
      <p className="text-center text-base font-light italic text-[var(--text-secondary)] max-w-[600px] mx-auto px-4 pb-20 pt-4 text-balance">
        You&apos;re right where you&apos;re supposed to be.
      </p>
    </main>
  );
}
