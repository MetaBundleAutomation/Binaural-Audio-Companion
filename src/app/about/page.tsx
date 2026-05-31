import Link from "next/link";
import Icon from "@/components/Icons";

const BENEFITS = [
  {
    icon:        "focus",
    title:       "Focus",
    description: "Quiets mental scatter so you can lock onto one thing at a time. Useful when tasks feel hard to start, concentration keeps slipping, or you need to sustain deep work for longer.",
  },
  {
    icon:        "relaxation",
    title:       "Calm",
    description: "Eases the low-level tension and restlessness that build through the day. A reliable reset for the moments when your mind won't settle and you need to bring the pressure down.",
  },
  {
    icon:        "sleep",
    title:       "Sleep",
    description: "Guides your brain toward the slower rhythms of deep rest. Helpful when you can't switch off at night, when sleep feels shallow, or when you wake in the early hours and struggle to return.",
  },
  {
    icon:        "creativity",
    title:       "Creativity",
    description: "Opens up looser, more associative thinking. Good for creative work, brainstorming, or any time you feel mentally stuck and need ideas to start flowing again.",
  },
  {
    icon:        "energy",
    title:       "Energy",
    description: "Lifts mental alertness and physical readiness without caffeine. A useful way to begin a demanding day, push through an afternoon slump, or prepare your mind before something that requires full presence.",
  },
  {
    icon:        "meditation",
    title:       "Meditation",
    description: "Deepens and stabilises meditative states, making it easier to stay present and let thoughts pass. Useful for regular practice, or as an anchor when the mind is especially hard to quiet.",
  },
  {
    icon:        "pain",
    title:       "Pain Management",
    description: "Encourages a calm, settled state that can help ease physical tension and take the edge off discomfort. A gentle option for winding down when aches or soreness make it hard to relax.",
  },
  {
    icon:        "anxiety",
    title:       "Anxiety Relief",
    description: "Lowers the background hum of worry and helps regulate an overactive nervous system. Useful during periods of acute stress or as part of a longer-term routine for managing chronic tension.",
  },
];

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

            {/* What are Binaural Beats */}
            <div className="bg-[var(--background-card)] rounded-2xl p-8 border border-[var(--border-color)]">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">What are Binaural Beats?</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                Binaural beats are an auditory illusion created when two slightly different frequencies
                are played in each ear. Your brain perceives a third tone — the &quot;beat&quot; — equal to
                the difference between the two. For example, if 200 Hz is played in the left ear and
                210 Hz in the right, your brain perceives a 10 Hz beat. Over time, the brain tends to
                synchronise its own electrical activity toward that frequency, a process known as
                brainwave entrainment.
              </p>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                CRUX also includes a set of tracks built on a different principle: alternating
                left-right audio stimulation. Rather than a frequency difference, these tracks pulse
                a tone rhythmically between the left and right ears at a steady beat. The result is
                grounding and physically engaging in a way that complements the binaural sessions —
                a distinct technique for moments when rhythmic bilateral movement is the goal.
              </p>
            </div>

            {/* Brain Wave Types */}
            <div className="bg-[var(--background-card)] rounded-2xl p-8 border border-[var(--border-color)]">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Brain Wave Types</h2>
              <ul className="space-y-3 text-[var(--text-secondary)]">
                <li><strong className="text-[var(--text-primary)]">Delta (0.5–4 Hz):</strong> Deep sleep and physical restoration</li>
                <li><strong className="text-[var(--text-primary)]">Theta (4–8 Hz):</strong> Meditation, creativity, and the edge of sleep</li>
                <li><strong className="text-[var(--text-primary)]">Alpha (8–12 Hz):</strong> Calm alertness, relaxed focus, and stress reduction</li>
                <li><strong className="text-[var(--text-primary)]">Beta (13–30 Hz):</strong> Active thinking, concentration, and sustained attention</li>
                <li><strong className="text-[var(--text-primary)]">Gamma (30–100 Hz):</strong> High-level cognition, peak focus, and information processing</li>
              </ul>
            </div>

            {/* Benefits */}
            <div className="bg-[var(--background-card)] rounded-2xl p-8 border border-[var(--border-color)]">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-8 text-center">Benefits</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {BENEFITS.map(({ icon, title, description }) => (
                  <div key={title} className="flex flex-col items-center text-center">
                    <div className="mb-4 text-[var(--primary)]">
                      <Icon name={icon} size={48} />
                    </div>
                    <h3 className="text-[17px] font-bold mb-2 text-[var(--text-primary)]">{title}</h3>
                    <p className="text-sm font-medium leading-relaxed text-[var(--text-secondary)]">
                      {description}
                    </p>
                  </div>
                ))}
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
