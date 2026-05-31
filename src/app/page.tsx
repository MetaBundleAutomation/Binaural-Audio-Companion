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
      </section>

      <div className="max-w-[1400px] mx-auto px-5">
        <Player />
      </div>

      {/* Closing affirmation — a quiet bookend to the greeting at the top */}
      <p className="text-center text-sm md:text-base font-light italic text-[var(--text-secondary)] max-w-[600px] mx-auto px-4 pb-20 pt-4 text-balance">
        You&apos;re right where you&apos;re supposed to be.
      </p>
    </main>
  );
}
