import Link from "next/link";

export default function Instructions() {
  return (
    <main className="min-h-screen">
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-6 text-center">
            How to Use MindFlow
          </h1>
          <p className="text-lg text-[var(--text-secondary)] mb-12 text-center max-w-2xl mx-auto">
            Simple guidelines to help you get the most from your binaural audio sessions.
          </p>

          <div className="space-y-6">

            {/* Before You Begin */}
            <div className="bg-[var(--background-card)] rounded-2xl p-8 border border-[var(--border-color)]">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">🎧 Before You Begin</h2>
              <ul className="space-y-4 text-[var(--text-secondary)] leading-relaxed">
                <li>
                  <strong className="text-[var(--text-primary)]">Use stereo headphones.</strong>{" "}
                  Binaural beats only work when each ear receives a slightly different frequency.
                  Speakers blend the two channels and eliminate the effect entirely.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Lower your volume first.</strong>{" "}
                  Set your device to a low, comfortable level before pressing play. Loud audio
                  causes discomfort and reduces the benefit. The audio fades in gently over the
                  first three seconds — there is no need to start loud.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Find a quiet space.</strong>{" "}
                  A calm environment helps your mind settle faster. If background noise is
                  unavoidable, use the Noise Therapy section to mask it.
                </li>
              </ul>
            </div>

            <hr className="border-[var(--border-color)]" />

            {/* Choosing a Session */}
            <div className="bg-[var(--background-card)] rounded-2xl p-8 border border-[var(--border-color)]">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">🧠 Choosing a Session</h2>
              <ul className="space-y-3 text-[var(--text-secondary)] leading-relaxed">
                <li>
                  <strong className="text-[var(--text-primary)]">Focus (25 Hz Beta)</strong> —
                  Concentration, studying, or any task requiring sharp mental attention.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Calm (12 Hz Alpha)</strong> —
                  Unwinding after a demanding day or easing into rest.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Sleep (4 Hz Delta)</strong> —
                  Falling asleep or returning to sleep after waking at night.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Creativity (8 Hz Alpha)</strong> —
                  Open-ended thinking, problem solving, or creative work.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Energy (30 Hz Beta)</strong> —
                  Physical exercise or building mental alertness before a demanding task.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Meditation (6 Hz Theta)</strong> —
                  Daily mindfulness practice or grounding after a stressful event.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Learning (10 Hz Alpha)</strong> —
                  Reading, studying, or absorbing new information.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Anxiety (8 Hz Alpha)</strong> —
                  Reducing acute stress and quieting an overactive nervous system.
                </li>
              </ul>
            </div>

            <hr className="border-[var(--border-color)]" />

            {/* Playing a Session */}
            <div className="bg-[var(--background-card)] rounded-2xl p-8 border border-[var(--border-color)]">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">▶️ Playing a Session</h2>
              <ul className="space-y-3 text-[var(--text-secondary)] leading-relaxed">
                <li>
                  Swipe or use the arrows in the <strong className="text-[var(--text-primary)]">Audio Library</strong> to browse,
                  then tap the centre card to load it into the player.
                </li>
                <li>
                  Press the large <strong className="text-[var(--text-primary)]">Play button</strong> to begin.
                  Audio fades in softly over the first three seconds.
                </li>
                <li>
                  Each session is <strong className="text-[var(--text-primary)]">15 minutes</strong> and fades
                  out gently over the final five minutes — no abrupt ending.
                </li>
                <li>
                  Use the <strong className="text-[var(--text-primary)]">progress bar</strong> to skip
                  to any point. The ← → arrow buttons jump to the previous or next track.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Space bar</strong> pauses and resumes;
                  ← → arrow keys change track — useful if you have your phone in your pocket.
                </li>
              </ul>
            </div>

            <hr className="border-[var(--border-color)]" />

            {/* Loop Mode */}
            <div className="bg-[var(--background-card)] rounded-2xl p-8 border border-[var(--border-color)]">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">🔁 Loop Mode</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                Press the <strong className="text-[var(--text-primary)]">Loop button</strong> to repeat the
                session continuously — useful for extended meditation, sleep support, or long work blocks.
              </p>
              <ul className="space-y-2 text-[var(--text-secondary)] leading-relaxed">
                <li>
                  While looping, the fade-out is suspended and a lap-timer shows how far through
                  the current 15-minute cycle you are.
                </li>
                <li>
                  Turning loop off re-anchors the timer to your current position in the cycle,
                  so the fade-out resumes naturally from that point.
                </li>
                <li>Loop resets automatically when you switch tracks.</li>
              </ul>
            </div>

            <hr className="border-[var(--border-color)]" />

            {/* Noise Therapy */}
            <div className="bg-[var(--background-card)] rounded-2xl p-8 border border-[var(--border-color)]">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">🌊 Noise Therapy</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                White, pink, and brown noise can be played alongside — or instead of — binaural
                beats. Steady background noise masks sudden environmental sounds that can trigger
                a stress response, giving your nervous system something predictable to hold on to.
              </p>
              <ul className="space-y-3 text-[var(--text-secondary)] leading-relaxed">
                <li>
                  <strong className="text-[var(--text-primary)]">White noise</strong> — all frequencies
                  at equal strength, like a fan or static rain. Good for concentration and blocking
                  unpredictable sounds.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Pink noise</strong> — stronger at low
                  frequencies, like rainfall or wind. Promotes deeper sleep and reduces sensitivity
                  to intrusive thoughts.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Brown noise</strong> — a deep bass
                  rumble like distant thunder. Preferred by many for reducing hypervigilance at night.
                </li>
                <li>
                  Enable <strong className="text-[var(--text-primary)]">Auto-sync</strong> to have
                  noise start and stop automatically with your binaural audio.
                </li>
              </ul>
            </div>

            <hr className="border-[var(--border-color)]" />

            {/* Box Breathing */}
            <div className="bg-[var(--background-card)] rounded-2xl p-8 border border-[var(--border-color)]">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">💨 Box Breathing</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                Box breathing is a regulated breathing technique used to reduce acute stress. It
                activates the parasympathetic nervous system, slowing heart rate and calming
                the body&apos;s threat response. The pattern is simple:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { step: "Inhale", seconds: "4 sec" },
                  { step: "Hold",   seconds: "4 sec" },
                  { step: "Exhale", seconds: "4 sec" },
                  { step: "Hold",   seconds: "4 sec" },
                ].map(({ step, seconds }) => (
                  <div
                    key={step + seconds}
                    className="rounded-xl p-4 text-center border border-[var(--border-color)] bg-[var(--background-light)]"
                  >
                    <p className="font-bold text-[var(--text-primary)] text-[15px]">{step}</p>
                    <p className="text-[var(--text-secondary)] text-[13px] mt-1">{seconds}</p>
                  </div>
                ))}
              </div>
              <p className="text-[var(--text-secondary)] text-[14px] leading-relaxed">
                Works well combined with the <strong className="text-[var(--text-primary)]">Calm</strong> or{" "}
                <strong className="text-[var(--text-primary)]">Meditation</strong> sessions.
              </p>
            </div>

            <hr className="border-[var(--border-color)]" />

            {/* Combining Sessions */}
            <div className="bg-[var(--background-card)] rounded-2xl p-8 border border-[var(--border-color)]">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">✨ Combining Sessions for Deeper Relaxation</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-5">
                You can layer all three tools at the same time for a richer experience.
                Try this sequence:
              </p>
              <ol className="space-y-4 text-[var(--text-secondary)] leading-relaxed list-decimal list-outside pl-5">
                <li>
                  <strong className="text-[var(--text-primary)]">Start with Noise Therapy.</strong>{" "}
                  Pick a background sound — Brown Noise, Pink Noise, or White Noise work well —
                  and set the volume low (around 30%). This becomes your gentle base layer.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Add a Binaural Beat.</strong>{" "}
                  Open the Audio Library and choose a beat that matches your goal — Calm or Sleep
                  for winding down, Focus for deep work. Set it slightly louder than the noise so
                  you can feel it through the background.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Open Box Breathing.</strong>{" "}
                  Follow the visual guide — breathe in, hold, breathe out, hold. Let the animation
                  set your pace.
                </li>
              </ol>
              <p className="text-[var(--text-secondary)] leading-relaxed mt-5">
                Together, the noise softens distractions, the beat shapes your mental state, and
                the breathing brings your body along. Try it for 10 minutes and notice how you feel.
              </p>
              <blockquote className="mt-5 pl-4 border-l-2 border-[var(--border-color)] text-[var(--text-secondary)] text-[14px] leading-relaxed">
                <strong className="text-[var(--text-primary)]">No wrong way.</strong>{" "}
                If three feels like too much, use any two — or just one. The right combination
                is whichever one you&apos;ll actually use.
              </blockquote>
            </div>

            <hr className="border-[var(--border-color)]" />

            {/* Safety */}
            <div
              className="bg-[var(--background-card)] rounded-2xl p-8 border"
              style={{ borderColor: "rgba(220, 38, 38, 0.25)" }}
            >
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">⚠️ Safety Information</h2>
              <ul className="space-y-3 text-[var(--text-secondary)] leading-relaxed">
                <li>
                  <strong className="text-[var(--text-primary)]">Stop immediately</strong> if you
                  experience discomfort, dizziness, or heightened anxiety.
                </li>
                <li>
                  Do not use binaural beats if you have{" "}
                  <strong className="text-[var(--text-primary)]">epilepsy or a seizure disorder</strong>{" "}
                  without first consulting your doctor.
                </li>
                <li>
                  Do not use while{" "}
                  <strong className="text-[var(--text-primary)]">driving or operating machinery</strong> —
                  binaural beats are designed to alter your mental state.
                </li>
                <li>
                  MindFlow is a <strong className="text-[var(--text-primary)]">wellness aid</strong>,
                  not a medical device. It does not replace professional mental health care.
                </li>
                <li>
                  If you are in crisis, contact{" "}
                  <strong className="text-[var(--text-primary)]">
                    Open Arms Veterans &amp; Families Counselling
                  </strong>{" "}
                  on{" "}
                  <a
                    href="tel:1800011046"
                    className="underline underline-offset-2 text-[var(--primary)] hover:opacity-80"
                  >
                    1800 011 046
                  </a>{" "}
                  (free, 24/7).
                </li>
              </ul>
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
