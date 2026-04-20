import Player from "@/components/Player";
import LaunchScrollHandler from "@/components/LaunchScrollHandler";

export default function Home() {
  return (
    <main className="min-h-screen">
      <LaunchScrollHandler />

      {/* Hero Section */}
      <section id="hero" className="text-center py-20 px-4">
        <p className="text-sm md:text-base text-[var(--text-secondary)] max-w-[600px] mx-auto font-medium leading-relaxed">
          Simple audio sessions to help you feel calmer, focus more clearly, or ease into sleep.
        </p>
      </section>

      <div className="max-w-[1400px] mx-auto px-5">
        <Player />
      </div>
    </main>
  );
}
