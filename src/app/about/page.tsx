import Link from "next/link";
import Icon from "@/components/Icons";

const BENEFITS = [
  {
    icon:        "focus",
    title:       "Focus",
    description: "Quiets mental scatter so you can lock onto one thing at a time. Pair the higher-frequency focus sessions with steady background noise to block distractions and sustain deep work for longer.",
  },
  {
    icon:        "relaxation",
    title:       "Calm",
    description: "Eases the low-level tension and restlessness that build through the day. Bring the pressure down with the calming alpha sessions, or steady yourself in a couple of minutes with box breathing.",
  },
  {
    icon:        "sleep",
    title:       "Sleep",
    description: "Guides your brain toward the slower rhythms of deep rest. Combine the delta sleep sessions with pink, brown, or rain noise to mask disturbances when you can't switch off at night.",
  },
  {
    icon:        "creativity",
    title:       "Creativity",
    description: "Opens up looser, more associative thinking. Good for brainstorming or any time you feel mentally stuck — the theta sessions help ideas start flowing again.",
  },
  {
    icon:        "energy",
    title:       "Energy",
    description: "Lifts mental alertness and physical readiness without caffeine. A useful way to begin a demanding day or push through an afternoon slump with the higher-frequency beta and gamma sessions.",
  },
  {
    icon:        "meditation",
    title:       "Meditation",
    description: "Deepens and stabilises meditative states, making it easier to stay present and let thoughts pass. The theta sessions and the steady rhythm of box breathing both help you settle in.",
  },
  {
    icon:        "pain",
    title:       "Pain Management",
    description: "Encourages a calm, settled state that can ease physical tension and take the edge off discomfort. A gentle wind-down using the calming sessions alongside slow box breathing.",
  },
  {
    icon:        "anxiety",
    title:       "Anxiety Relief",
    description: "Lowers the background hum of worry and helps regulate an overactive nervous system. Reach for the calming sessions for a longer reset, or box breathing to settle yourself in the moment.",
  },
  {
    icon:        "tinnitus",
    title:       "Tinnitus Relief",
    description: "A steady background sound — or the adjustable Pure Tone — can blend with the ringing of tinnitus and make it less noticeable, easing the distraction so it's easier to rest, focus, or fall asleep.",
  },
  {
    icon:        "breath",
    title:       "Mind-Body Relaxation",
    description: "A gentle way to release tension in both mind and body. A few slow rounds of box breathing ease your heart rate and quiet the nervous system, letting you unwind at your own pace.",
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
            Enhance your mental well-being with binaural beats, noise therapy, and box breathing —
            tools for focus, calm, and sleep.
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

            {/* What is Noise Therapy */}
            <div className="bg-[var(--background-card)] rounded-2xl p-8 border border-[var(--border-color)]">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">What is Noise Therapy?</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Noise Therapy uses steady, broadband sound to soften the contrast between quiet and
                sudden, unpredictable noises — a door slamming, a dog barking — that can jolt the
                nervous system. By filling the gaps with a constant, predictable backdrop, those
                startling sounds blend in instead of standing out, giving your brain less to react to.
                White, pink, and brown noise differ in their balance of high and low frequencies, while
                the Pure Tone option produces a single adjustable pitch you can tune just below your
                tinnitus to make the ringing less noticeable.
              </p>
            </div>

            {/* What is Box Breathing */}
            <div className="bg-[var(--background-card)] rounded-2xl p-8 border border-[var(--border-color)]">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">What is Box Breathing?</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Box breathing is a paced breathing technique — inhale, hold, exhale, hold, each for an
                equal count — used by everyone from athletes to emergency responders to steady
                themselves under pressure. The slow, even rhythm and the gentle breath-holds activate
                the parasympathetic nervous system, the body&apos;s &quot;rest and digest&quot; branch,
                which lowers heart rate and dials down the stress response. With regular practice it
                becomes a reliable way to return to calm in a couple of minutes.
              </p>
            </div>

            {/* Benefits */}
            <div className="bg-[var(--background-card)] rounded-2xl p-8 border border-[var(--border-color)]">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3 text-center">Benefits</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed text-center max-w-2xl mx-auto mb-8">
                Delivered across CRUX&apos;s three tools — binaural beats, noise therapy, and box breathing.
              </p>
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
