import Player from "@/components/Player";
import Icon from "@/components/Icons";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section id="hero" className="text-center py-20 px-4">
        <p className="text-sm md:text-base text-[var(--text-secondary)] max-w-[600px] mx-auto font-medium leading-relaxed">
          Synchronize your brain&apos;s neural activity for Mental Clarity, Focus, Relaxation or Sleep
        </p>
      </section>

      <div className="max-w-[1400px] mx-auto px-5">
        <Player />

        {/* Benefits Section */}
        <section id="features" className="my-20 py-16">
          <h2 className="text-[40px] font-bold mb-10 text-center tracking-tight text-[var(--text-primary)]">
            Benefits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[var(--background-card)] rounded-2xl p-8 text-center border border-[var(--border-color)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary)] min-h-[280px] flex flex-col justify-start">
              <div className="flex justify-center mb-4 text-[var(--primary)]">
                <Icon name="focus" size={48} />
              </div>
              <h3 className="text-[23px] font-bold mb-3 text-[var(--text-primary)]">Focus</h3>
              <p className="text-base font-medium leading-relaxed text-[var(--text-secondary)]">
                Helps quiet the mental noise so you can concentrate on one thing at a time. Useful when your thoughts are scattered, tasks feel hard to start, or your mind keeps drifting away from what you&apos;re trying to do.
              </p>
            </div>
            <div className="bg-[var(--background-card)] rounded-2xl p-8 text-center border border-[var(--border-color)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary)] min-h-[280px] flex flex-col justify-start">
              <div className="flex justify-center mb-4 text-[var(--primary)]">
                <Icon name="relaxation" size={48} />
              </div>
              <h3 className="text-[23px] font-bold mb-3 text-[var(--text-primary)]">Relaxation</h3>
              <p className="text-base font-medium leading-relaxed text-[var(--text-secondary)]">
                Eases the physical tension and mental restlessness that build up through the day. A good starting point if you feel wound up, on edge, or just need something to take the pressure down a notch before it becomes overwhelming.
              </p>
            </div>
            <div className="bg-[var(--background-card)] rounded-2xl p-8 text-center border border-[var(--border-color)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary)] min-h-[280px] flex flex-col justify-start">
              <div className="flex justify-center mb-4 text-[var(--primary)]">
                <Icon name="sleep" size={48} />
              </div>
              <h3 className="text-[23px] font-bold mb-3 text-[var(--text-primary)]">Sleep</h3>
              <p className="text-base font-medium leading-relaxed text-[var(--text-secondary)]">
                Guides your mind into the slower rhythms it naturally moves through as you fall asleep. Helpful when you can&apos;t switch off at night, wake in the early hours, or find that deep, restful sleep is hard to reach.
              </p>
            </div>
          </div>

          <div className="text-center mt-10">
            <a
              href="#hero"
              className="inline-block px-6 py-3 rounded-lg text-base font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
              style={{ background: "var(--primary)", boxShadow: "var(--shadow)" }}
            >
              Back to Home
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
