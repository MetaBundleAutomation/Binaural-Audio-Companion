import Link from "next/link";
import Icon from "@/components/Icons";

export default function About() {
  return (
    <main className="min-h-screen">
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-6 text-center">
            About CRUX
          </h1>
          <p className="text-lg text-[var(--text-secondary)] mb-12 text-center max-w-2xl mx-auto">
            Enhance your mental well-being with scientifically-designed binaural beats audio therapy.
          </p>

          <div className="space-y-8">
            <div className="bg-[var(--background-card)] rounded-2xl p-8 border border-[var(--border-color)]">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">What are Binaural Beats?</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Binaural beats are an auditory illusion created when two slightly different frequencies are played in each ear.
                Your brain perceives a third tone — the &quot;beat&quot; — equal to the difference between the two frequencies.
                For example, if 200 Hz is played in the left ear and 210 Hz in the right ear, your brain perceives a 10 Hz binaural beat.
              </p>
            </div>

            <div className="bg-[var(--background-card)] rounded-2xl p-8 border border-[var(--border-color)]">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Brain Wave Types</h2>
              <ul className="space-y-3 text-[var(--text-secondary)]">
                <li><strong className="text-[var(--text-primary)]">Delta (0.5-4 Hz):</strong> Deep sleep and relaxation</li>
                <li><strong className="text-[var(--text-primary)]">Theta (4-8 Hz):</strong> Meditation, creativity, and light sleep</li>
                <li><strong className="text-[var(--text-primary)]">Alpha (8-12 Hz):</strong> Relaxation with closed eyes, calm focus</li>
                <li><strong className="text-[var(--text-primary)]">Beta (13-30 Hz):</strong> Active thinking, concentration, alertness</li>
                <li><strong className="text-[var(--text-primary)]">Gamma (30-100 Hz):</strong> High-level cognition and problem solving</li>
              </ul>
            </div>

            <div className="bg-[var(--background-card)] rounded-2xl p-8 border border-[var(--border-color)]">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">How to Use</h2>
              <ul className="space-y-2 text-[var(--text-secondary)]">
                <li>Use stereo headphones for the best effect</li>
                <li>Find a comfortable, quiet environment</li>
                <li>Select a track matching your desired mental state</li>
                <li>Close your eyes and relax</li>
                <li>Listen for at least 15-30 minutes for noticeable effects</li>
              </ul>
            </div>

            <div className="bg-[var(--background-card)] rounded-2xl p-8 border border-[var(--border-color)]">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-8 text-center">Benefits</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 text-[var(--primary)]">
                    <Icon name="focus" size={48} />
                  </div>
                  <h3 className="text-[19px] font-bold mb-2 text-[var(--text-primary)]">Focus</h3>
                  <p className="text-sm font-medium leading-relaxed text-[var(--text-secondary)]">
                    Helps quiet the mental noise so you can concentrate on one thing at a time. Useful when your thoughts are scattered, tasks feel hard to start, or your mind keeps drifting away from what you&apos;re trying to do.
                  </p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 text-[var(--primary)]">
                    <Icon name="relaxation" size={48} />
                  </div>
                  <h3 className="text-[19px] font-bold mb-2 text-[var(--text-primary)]">Relaxation</h3>
                  <p className="text-sm font-medium leading-relaxed text-[var(--text-secondary)]">
                    Eases the physical tension and mental restlessness that build up through the day. A good starting point if you feel wound up, on edge, or just need something to take the pressure down a notch.
                  </p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 text-[var(--primary)]">
                    <Icon name="sleep" size={48} />
                  </div>
                  <h3 className="text-[19px] font-bold mb-2 text-[var(--text-primary)]">Sleep</h3>
                  <p className="text-sm font-medium leading-relaxed text-[var(--text-secondary)]">
                    Guides your mind into the slower rhythms it naturally moves through as you fall asleep. Helpful when you can&apos;t switch off at night or find that deep, restful sleep is hard to reach.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/"
              className="inline-block px-8 py-3 rounded-lg text-base font-semibold text-white transition-all duration-300 hover:-translate-y-0.5"
              style={{ background: "var(--primary)", boxShadow: "var(--shadow)" }}
            >
              Start Listening
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
