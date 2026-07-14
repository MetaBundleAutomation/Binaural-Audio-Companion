import Link from "next/link";

export default function Instructions() {
  return (
    <main className="min-h-screen">
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-6 text-center">
            How to Use CRUX
          </h1>
          <p className="text-lg text-[var(--text-secondary)] mb-12 text-center max-w-2xl mx-auto">
            Simple guidelines to help you get the most from your binaural audio sessions.
          </p>

          <div className="space-y-6">

            {/* Where would you like to start? */}
            <div className="bg-[var(--background-card)] rounded-2xl p-8 border border-[var(--border-color)]">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-5">🧭 Where would you like to start?</h2>
              <ul className="space-y-4 text-[var(--text-secondary)] leading-relaxed">
                <li>
                  <strong className="text-[var(--text-primary)]">I want to feel calmer right now</strong>
                  {" → "}Box Breathing or Heart–Brain Coherence (Balanced preset) for a few minutes is a good place to begin.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">I want a quieter mind</strong>
                  {" → "}Try the Calm or Meditation beat, layered softly with Pink or Brown Noise.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">I want deeper, more restful sleep</strong>
                  {" → "}Try the Wind Down routine below — Sleep beat, Brown Noise, and the Body Scan together.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">I want to think more clearly</strong>
                  {" → "}For sustained attention, the Focus beat with White Noise works well. For complex problem solving or higher-order thinking, try the Reasoning beat (64 Hz Gamma).
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">I want some quiet from the noise around me</strong>
                  {" → "}Noise Therapy is a good starting point — try Brown Noise, Heavy Rain, or the Pure Tone if you want to find your own pitch.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">I want to ease into stillness</strong>
                  {" → "}The Body Scan is a gentle place to start — just lie down, press play, and let the narrator guide you.
                </li>
              </ul>
            </div>

            <hr className="border-[var(--border-color)]" />

            {/* Wind Down — pre-sleep routine */}
            <div className="bg-[var(--background-card)] rounded-2xl p-8 border border-[var(--border-color)]">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">🌙 Wind Down — A pre-sleep routine</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-5">
                A simple sequence that uses all three tools together. Most people are settled well before it ends.
              </p>
              <ol className="space-y-4 text-[var(--text-secondary)] leading-relaxed list-decimal list-outside pl-5 mb-5">
                <li>
                  Open <strong className="text-[var(--text-primary)]">Noise Therapy</strong> and select Brown Noise or Heavy Rain.
                  Set the volume low — around 30%.
                </li>
                <li>
                  In the <strong className="text-[var(--text-primary)]">Binaural Beats</strong> player, select Sleep (1 Hz Delta).
                  Set it just above the noise so you can feel it beneath.
                </li>
                <li>
                  When you&apos;re comfortable, open the <strong className="text-[var(--text-primary)]">Body Scan</strong> and press play.
                  Let the narrator guide you the rest of the way.
                </li>
              </ol>
              <blockquote className="pl-4 border-l-2 border-[var(--border-color)] text-[var(--text-secondary)] text-[14px] leading-relaxed">
                If you wake during the night, skip straight to Brown Noise or the Body Scan — no need to start from the beginning.
              </blockquote>
            </div>

            <hr className="border-[var(--border-color)]" />

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

            {/* Choosing a Binaural Beat */}
            <div id="choosing-a-binaural-beat" className="scroll-mt-24 bg-[var(--background-card)] rounded-2xl p-8 border border-[var(--border-color)]">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">🧠 Choosing a Binaural Beat</h2>

              {/* How binaural beats work */}
              <p className="text-[var(--text-secondary)] leading-relaxed mb-5">
                Binaural beats work by playing two slightly different tones — one in each ear.
                Your brain perceives the small difference between them as a single pulsing
                &quot;beat.&quot; Because the effect is created inside your brain from the two
                separate signals, stereo headphones are essential — playing the sound through a
                speaker won&apos;t work.
              </p>

              {/* How to use them */}
              <p className="font-bold text-[var(--text-primary)] mb-3">How to use them</p>
              <ol className="list-decimal list-outside pl-5 space-y-2 text-[var(--text-secondary)] leading-relaxed mb-6">
                <li>Put on stereo headphones (not a single earbud or a speaker).</li>
                <li>
                  Pick a track matched to your goal — lower frequency ranges (delta/theta) are
                  commonly used for sleep, deep relaxation, or meditation, while higher ranges
                  (alpha/beta/gamma) suit calm focus, alertness, and higher-order thinking.
                </li>
                <li>Listen for around 10–15 minutes, ideally with your eyes closed or while doing a calm activity.</li>
              </ol>

              {/* Which beat to choose */}
              <p className="font-bold text-[var(--text-primary)] mb-3">Which beat to choose</p>

              {/* ── Binaural beats group ───────────────────────────────────── */}
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                <strong className="text-[var(--text-primary)]">Binaural beats</strong> — two tones,
                one in each ear; the perceived beat gently encourages a matching mental state.
                Slower beats (delta/theta) suit rest and relaxation, while faster beats (alpha/beta/gamma)
                suit calm focus, alertness, and higher-order thinking.
              </p>
              <ul className="space-y-3 text-[var(--text-secondary)] leading-relaxed">
                <li>
                  <strong className="text-[var(--text-primary)]">Focus (10 Hz Alpha)</strong> —
                  Concentration, studying, or any task requiring sharp mental attention.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Calm (12 Hz Alpha)</strong> —
                  Unwinding after a demanding day or easing into rest.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Sleep (1 Hz Delta)</strong> —
                  Falling asleep or returning to sleep after waking at night.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Creativity (7 Hz Theta)</strong> —
                  Open-ended thinking, problem solving, or creative work.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Energy (25 Hz Beta)</strong> —
                  Physical exercise or building mental alertness before a demanding task.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Reasoning (64 Hz Gamma)</strong> —
                  Higher-order thinking, complex problem solving, or moments when you want your mind at its clearest.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Meditation (6 Hz Theta)</strong> —
                  Daily mindfulness practice or grounding after a stressful event.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Pain Management (9 Hz Alpha)</strong> —
                  Encouraging deep relaxation to help ease physical tension and discomfort.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Anxiety (4 Hz Theta)</strong> —
                  Reducing stress and quieting an overactive nervous system.
                </li>
              </ul>

              {/* ── Divider between the two track types ─────────────────────── */}
              <hr className="border-[var(--border-color)] my-6" />

              {/* ── Bilateral tracks group ─────────────────────────────────── */}
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                <strong className="text-[var(--text-primary)]">Bilateral tracks (left–right audio)</strong>{" "}
                — these work differently from binaural beats: instead of two tones, a single soft tone
                alternates between your left and right ear at a steady pace (50, 60 or 70 pulses per
                minute), so stereo headphones are needed. Many people find the predictable side-to-side
                rhythm grounding — a simple, steady pattern to settle into — with the slower pace
                feeling calmer and the brisker pace a little more alert.
              </p>
              <ul className="space-y-3 text-[var(--text-secondary)] leading-relaxed">
                <li>
                  <strong className="text-[var(--text-primary)]">50 BPM Bilateral</strong> —
                  Slow, rhythmic left-right audio — a gentle pace for unwinding or quieting a busy mind.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">60 BPM Bilateral</strong> —
                  Steady left-right audio at a natural, comfortable rhythm — easy to settle into.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">70 BPM Bilateral</strong> —
                  Brisker left-right audio for those who find a livelier rhythm easier to relax with.
                </li>
              </ul>

              <Link
                href="/#player"
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold text-[var(--primary)] bg-[var(--background-light)] border border-[var(--border-color)] hover:border-[var(--primary)] transition-all"
              >
                <svg
                  viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className="w-4 h-4"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="10 8 16 12 10 16 10 8" />
                </svg>
                Tap to open Binaural Beats
              </Link>

              <div className="mt-6 pt-5 border-t border-[var(--border-color)]">
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  <strong className="text-[var(--text-primary)]">The science.</strong>{" "}
                  The binaural beat phenomenon was first documented by Heinrich Wilhelm Dove in 1839
                  and described in neurological detail by Gerald Oster in{" "}
                  <em>Scientific American</em> (1973): when two tones of slightly different
                  frequencies are delivered separately to each ear, the brain perceives a single
                  pulsing beat at the difference between them. A review by Chaieb et al. (2015),
                  published in{" "}
                  <em>Frontiers in Psychiatry</em>, examined controlled research and found consistent
                  evidence that the perceived beat influences cortical activity, alertness, mood, and
                  cognitive performance in ways aligned with the target brainwave frequency range. A
                  subsequent meta-analysis by Garcia-Argibay et al. (2019), covering twenty-two
                  randomised controlled trials, found significant effects on anxiety, pain perception,
                  and mood. Bilateral tracks use a different mechanism — a single tone alternating
                  between ears at a steady rhythm — and draw on a separate literature linking
                  predictable rhythmic auditory stimulation to nervous system regulation and reduced
                  arousal. The Chaieb et al. review is freely available via{" "}
                  <a
                    href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4428073/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--primary)] underline hover:opacity-75"
                  >
                    NIH PubMed Central
                  </a>
                  .
                </p>
              </div>
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
                  The{" "}
                  <span className="inline-flex w-8 h-8 rounded-full items-center justify-center bg-[var(--background-card)] border border-[var(--border-color)] align-middle mx-0.5" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[var(--text-secondary)]"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" /></svg>
                  </span>
                  {" "}and{" "}
                  <span className="inline-flex w-8 h-8 rounded-full items-center justify-center bg-[var(--background-card)] border border-[var(--border-color)] align-middle mx-0.5" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[var(--text-secondary)]"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" /></svg>
                  </span>
                  {" "}buttons jump to the previous or next binaural beat.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Space bar</strong> pauses and resumes;
                  ← → arrow keys change track — useful if you have your phone in your pocket.
                </li>
              </ul>
            </div>

            <hr className="border-[var(--border-color)]" />

            {/* Noise Therapy */}
            <div id="noise-therapy" className="scroll-mt-24 bg-[var(--background-card)] rounded-2xl p-8 border border-[var(--border-color)]">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">🌊 Noise Therapy</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                White, pink, brown noise, and a heavy rain recording can be played alongside — or instead
                of — binaural beats. Steady background noise masks sudden environmental sounds that can
                trigger a stress response, giving your nervous system something predictable to hold on to.
              </p>
              <ul className="space-y-3 text-[var(--text-secondary)] leading-relaxed">
                <li>
                  <strong className="text-[var(--text-primary)]">White noise</strong> — all frequencies
                  at equal strength, like a steady fan or static. It masks sudden sounds that can
                  trigger a stress response, helping your nervous system settle, and is good for
                  concentration and blocking unpredictable noise.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Pink noise</strong> — louder at low
                  frequencies, softer at high — the pattern of rainfall, wind, and rivers. Promotes
                  deeper sleep stages and reduces the brain&apos;s sensitivity to intrusive thoughts.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Brown noise</strong> — a heavy bass
                  rumble, like distant thunder or ocean swells. The deepest tone of the group, and a
                  popular choice for reducing hypervigilance at night.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Heavy Rain</strong> — Rain on a tin roof — a dense, enveloping downpour that blends well with any binaural
                  beat and masks even persistent background noise, wrapping the room in steady,
                  grounding sound. Particularly effective for sleep and deep focus.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Gentle Rainforest Waterfall</strong> — a
                  recording of water tumbling over mossy rocks in a rainforest. Soft, flowing and
                  continuous — soothing for focus, relaxation or drifting off — and it comes with a
                  matching full-screen video.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Gentle Ocean Waves</strong> — the steady
                  wash of waves rolling onto the shore. A slow, rhythmic coastal sound that calms the mind
                  for unwinding and sleep, also paired with a full-screen video.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Pure Tone</strong> — a single, clean
                  tone you can tune to your own pitch and keep just below your tinnitus. Played gently,
                  it blends with the ringing so your brain notices it less, easing the distraction and
                  helping you rest or focus.
                </li>
                <li>
                  Enable <strong className="text-[var(--text-primary)]">Auto-sync</strong> to have
                  noise start and stop automatically with your binaural audio.
                </li>
              </ul>

              {/* Gentle Rainforest Waterfall / Gentle Ocean Waves — full-screen video how-to */}
              <h3 className="text-lg font-bold text-[var(--text-primary)] mt-6 mb-3">Full-screen nature videos</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                Gentle Rainforest Waterfall and Gentle Ocean Waves each pair their sound with a matching
                looping video for a more immersive experience.
              </p>
              <ul className="space-y-3 text-[var(--text-secondary)] leading-relaxed">
                <li>
                  <strong className="text-[var(--text-primary)]">Tap the tile</strong> to start the sound
                  and open the video full-screen — it fills the screen on any device.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Tap the video</strong> (or press Esc) to
                  close it. The sound keeps playing, so you can adjust the volume or stop it from the card.
                </li>
                <li>
                  The video is silent and loops smoothly — the sound comes from the audio, and the video
                  only downloads when you first open it.
                </li>
              </ul>

              {/* Pure Tone — how to use it for tinnitus */}
              <h3 className="text-lg font-bold text-[var(--text-primary)] mt-6 mb-3">Using Pure Tone for tinnitus</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                Pure Tone is a self-help comfort tool, not a treatment — but used gently it can make
                tinnitus easier to live with.
              </p>
              <ul className="space-y-3 text-[var(--text-secondary)] leading-relaxed">
                <li>
                  <strong className="text-[var(--text-primary)]">Find your pitch.</strong> Move the
                  slider until the tone sits closest to your tinnitus — often a high pitch (roughly
                  1,000–8,000 Hz). Nudging it slightly either side can improve the blend.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Keep it gentle.</strong> Set it low
                  and comfortable — just below your tinnitus, never loud or painful. If it ever makes
                  your symptoms worse, stop.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Use it the way that suits you.</strong> <em>In
                  the moment</em> — short sessions (around 10–60 minutes) when the ringing bothers you
                  most; <em>as a soft backdrop</em> — playing quietly for longer stretches, which some
                  people find reduces their awareness of it over time; <em>blended</em> — layered or
                  alternated with a noise or rain so you&apos;re not focused on the tinnitus alone.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Listen on good headphones</strong> for
                  a steady, accurate tone, and keep the volume modest.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Check in weekly.</strong> A quick note
                  on loudness, annoyance, sleep, and stress shows what&apos;s helping.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Pair it with other support.</strong> Relaxation,
                  good sleep habits, and professional care (CBT, an audiologist, hearing aids if needed)
                  do the most together.
                </li>
              </ul>
              <p className="text-[var(--text-secondary)] leading-relaxed mt-4">
                See a clinician if your tinnitus worsens or your hearing changes — and seek prompt care
                for sudden, one-sided, or pulsing tinnitus, dizziness, ear pain, or hearing loss.
              </p>

              <Link
                href="/#noise"
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold text-[var(--primary)] bg-[var(--background-light)] border border-[var(--border-color)] hover:border-[var(--primary)] transition-all"
              >
                <svg
                  viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className="w-4 h-4"
                  aria-hidden="true"
                >
                  <path d="M11 5 6 9H2v6h4l5 4V5z" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
                Tap to open Noise Therapy
              </Link>

              <div className="mt-6 pt-5 border-t border-[var(--border-color)]">
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  <strong className="text-[var(--text-primary)]">The science.</strong>{" "}
                  Steady background noise reduces sleep onset latency and masks the unpredictable
                  environmental sounds that trigger a stress response in the nervous system. A
                  randomised controlled trial by Messineo et al. (2017), published in{" "}
                  <em>Frontiers in Neurology</em>, found that broadband noise — the category that
                  includes white, pink, and brown noise — significantly reduced the time it takes to
                  fall asleep in healthy adults exposed to ambient noise. Separately, a body of
                  research on acoustic masking shows that steady, spectrally rich sounds reduce
                  the brain&apos;s sensitivity to intrusive background noise by raising the ambient
                  threshold, making sudden sounds less disruptive. The Messineo et al. trial is
                  freely available via{" "}
                  <a
                    href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5699003/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--primary)] underline hover:opacity-75"
                  >
                    NIH PubMed Central
                  </a>
                  .
                </p>
              </div>
            </div>

            <hr className="border-[var(--border-color)]" />

            {/* Box Breathing */}
            <div id="box-breathing" className="scroll-mt-24 bg-[var(--background-card)] rounded-2xl p-8 border border-[var(--border-color)]">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">💨 Box Breathing</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                Box breathing is a regulated breathing technique used to ease stress and tension. It
                activates the parasympathetic nervous system, slowing heart rate and calming
                the body&apos;s threat response. The pattern is simple:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { id: "inhale",   step: "Inhale", seconds: "4 sec" },
                  { id: "hold-in",  step: "Hold",   seconds: "4 sec" },
                  { id: "exhale",   step: "Exhale", seconds: "4 sec" },
                  { id: "hold-out", step: "Hold",   seconds: "4 sec" },
                ].map(({ id, step, seconds }) => (
                  <div
                    key={id}
                    className="rounded-xl p-4 text-center border border-[var(--border-color)] bg-[var(--background-light)]"
                  >
                    <p className="font-bold text-[var(--text-primary)] text-[15px]">{step}</p>
                    <p className="text-[var(--text-secondary)] text-[13px] mt-1">{seconds}</p>
                  </div>
                ))}
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                Breathe from your belly, not your chest, and stay relaxed during each Hold —
                there&apos;s no need to fill your lungs to their maximum capacity. The first few
                cycles may feel awkward, so give yourself a few minutes to adjust.
              </p>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                Your mind may wander at first, but after a few minutes the rhythm will feel more
                natural. Some people feel a little light-headed when they first start, so take a
                break if you feel uncomfortable. Your mind and body will adapt after two to four
                weeks of regular practice.
              </p>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                Box breathing works best with regular use — first thing in the morning,
                just before bed, or whenever you feel anxious.
              </p>
              <p className="text-[var(--text-secondary)] text-[14px] leading-relaxed">
                Works well with the <strong className="text-[var(--text-primary)]">Binaural Beats</strong> sessions.
              </p>
              <Link
                href="/#box-breathing"
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold text-[var(--primary)] bg-[var(--background-light)] border border-[var(--border-color)] hover:border-[var(--primary)] transition-all"
              >
                <svg
                  viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className="w-4 h-4"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="3.5" />
                </svg>
                Tap to open Box Breathing
              </Link>

              <div className="mt-6 pt-5 border-t border-[var(--border-color)]">
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  <strong className="text-[var(--text-primary)]">The science.</strong>{" "}
                  Box breathing&apos;s effects are grounded in a well-established body of research on slow,
                  paced breathing. A systematic review by Zaccaro et al. (2018), published in{" "}
                  <em>Frontiers in Human Neuroscience</em>, examined fifteen controlled studies and
                  found that slow breathing — roughly six breaths per minute or fewer — consistently
                  increases heart rate variability, activates the parasympathetic nervous system, and
                  reduces self-reported anxiety and stress. At approximately four breaths per minute,
                  the pace of a standard box breathing cycle, these effects are particularly pronounced.
                  The full review is freely available via{" "}
                  <a
                    href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6137615/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--primary)] underline hover:opacity-75"
                  >
                    NIH PubMed Central
                  </a>
                  .
                </p>
              </div>
            </div>

            <hr className="border-[var(--border-color)]" />

            {/* Coherence Breathing */}
            <div id="coherence-breathing" className="scroll-mt-24 bg-[var(--background-card)] rounded-2xl p-8 border border-[var(--border-color)]">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">💙 Heart–Brain Coherence</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
                Slow, paced breathing with a longer out-breath, combined with a genuine feeling of gratitude,
                guides your heart into a smooth, ordered rhythm of around one cycle every ten seconds — roughly
                0.1 Hz. Research links this coherent state to greater emotional stability, better stress
                regulation, and a quieter nervous system.
              </p>

              <h3 className="font-semibold text-[var(--text-primary)] mb-4">Three steps</h3>
              <div className="flex flex-col gap-4 mb-6">
                {[
                  {
                    n: "1",
                    head: "Drop into your heart.",
                    body: "Rest a hand over your heart. Your attention naturally follows touch — wherever you feel contact, awareness follows. This gently moves your focus out of your head and into your heart.",
                  },
                  {
                    n: "2",
                    head: "Breathe slow, exhale long.",
                    body: "Breathe so your out-breath is longer than your in-breath. Start wherever feels easy — it should never feel forced. A longer exhale activates your parasympathetic nervous system, telling your body it is safe. Imagine each breath flowing in and out through your heart.",
                  },
                  {
                    n: "3",
                    head: "Feel genuine gratitude.",
                    body: "Choose something real — your kids, your family, being alive, a good moment today. Most of the time we feel something only because of what is happening around us; here you are choosing the feeling on purpose. Sustained gratitude settles your heart into a coherent rhythm and brings your heart and brain into sync.",
                  },
                ].map(({ n, head, body }) => (
                  <div key={n} className="flex gap-4 items-start">
                    <span
                      className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: "var(--primary)" }}
                      aria-hidden="true"
                    >
                      {n}
                    </span>
                    <div>
                      <p className="font-semibold text-[var(--text-primary)] text-sm mb-0.5">{head}</p>
                      <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="font-semibold text-[var(--text-primary)] mb-3">Presets</h3>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: "Gentle",   detail: "3 s in · 5 s out", note: "Easy starting point" },
                  { label: "Balanced", detail: "4 s in · 6 s out", note: "The 0.1 Hz sweet spot" },
                  { label: "Deeper",   detail: "5 s in · 7 s out", note: "For experienced breathers" },
                ].map(({ label, detail, note }) => (
                  <div key={label} className="rounded-xl p-4 border border-[var(--border-color)] bg-[var(--background-light)]">
                    <p className="font-semibold text-[var(--text-primary)] text-sm mb-1">{label}</p>
                    <p className="text-[var(--primary)] text-xs font-mono mb-1">{detail}</p>
                    <p className="text-[var(--text-secondary)] text-xs">{note}</p>
                  </div>
                ))}
              </div>

              <Link
                href="/#coherence-breathing"
                className="mt-2 mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold text-[var(--primary)] bg-[var(--background-light)] border border-[var(--border-color)] hover:border-[var(--primary)] transition-all"
              >
                <svg
                  viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className="w-4 h-4"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="3.5" />
                </svg>
                Tap to try Coherence Breathing
              </Link>

              <blockquote className="mt-2 mb-6 pl-4 border-l-2 border-[var(--border-color)] text-[var(--text-secondary)] text-[14px] leading-relaxed">
                <strong className="text-[var(--text-primary)]">Tip:</strong>{" "}
                Many users enjoy layering a gentle binaural beat or soft noise quietly in the background
                during coherence sessions — try the Calm or Meditation beat, or pink or brown noise,
                kept low enough that the breath guide and chime stay clearly in front. Both volume
                controls remain accessible at the top of the page, so you can adjust or turn either
                off at any point without breaking the session.
              </blockquote>

              <div className="mt-6 pt-5 border-t border-[var(--border-color)]">
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  <strong className="text-[var(--text-primary)]">The science.</strong>{" "}
                  The research underpinning this technique comes from{" "}
                  <a
                    href="https://www.heartmath.org/research/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--primary)] underline hover:opacity-75"
                  >
                    HeartMath Institute
                  </a>
                  , who identified and measured heart rate variability (HRV) coherence, and from
                  peer-reviewed work linking slow paced breathing at around five to six breaths per minute
                  (the 0.1 Hz resonance frequency) to increased HRV, parasympathetic activation, and
                  improved stress regulation. The positive emotional engagement step builds on work by
                  McCraty et al. showing that sustained feelings of appreciation reliably shift the nervous
                  system toward a coherent state.
                </p>
              </div>
            </div>

            <hr className="border-[var(--border-color)]" />

            {/* Body Scan */}
            <div id="body-scan" className="scroll-mt-24 bg-[var(--background-card)] rounded-2xl p-8 border border-[var(--border-color)]">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">🧘 Body Scan</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
                A body scan is a guided mindfulness practice where you move your attention slowly and
                deliberately through each part of your body — from the crown of your head to the tips
                of your toes — noticing sensations as you go without trying to change them. It is one
                of the most widely studied mindfulness techniques and a core component of
                Mindfulness-Based Stress Reduction (MBSR), developed at the University of Massachusetts
                Medical School.
              </p>

              <h3 className="font-semibold text-[var(--text-primary)] mb-3">How it works</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
                Most of us carry tension we are not aware of — a braced jaw, raised shoulders, a breath
                that never quite fully releases. By resting calm, curious attention on each area of the
                body in turn, the body scan gradually signals to your nervous system that it is safe to
                let go. You are not trying to relax; you are simply noticing. That noticing — done
                without judgment — is what allows the body to soften on its own.
              </p>

              <h3 className="font-semibold text-[var(--text-primary)] mb-4">How to use it</h3>
              <div className="flex flex-col gap-4 mb-6">
                {[
                  {
                    n: "1",
                    head: "Find a comfortable position.",
                    body: "Lying down is ideal — on your bed or a mat with your arms resting at your sides. Sitting in a chair works just as well. Loosen anything tight, close your eyes, and settle in before pressing play.",
                  },
                  {
                    n: "2",
                    head: "Put on headphones and press play.",
                    body: "The narrator will guide you through each part of your body at a slow, steady pace. There is nothing to do except listen and notice — you do not need to prepare or follow along in advance.",
                  },
                  {
                    n: "3",
                    head: "Simply notice what is there.",
                    body: "Warmth, tingling, heaviness, tightness, or nothing at all — all of these are valid. You are not trying to feel something specific. Rest your attention wherever the narrator directs, and observe without judgment.",
                  },
                  {
                    n: "4",
                    head: "When your mind wanders, gently return.",
                    body: "Your attention will drift — that is completely normal and not a sign you are doing it wrong. Each time you notice and return your focus to the body, you are practising. There is no failing here.",
                  },
                  {
                    n: "5",
                    head: "Stay with it until the end.",
                    body: "The full session is around 15 minutes. You may feel drowsy as your body settles — that is a good sign. If you fall asleep, that is fine too. With regular practice, most people notice they carry less tension through the day.",
                  },
                ].map(({ n, head, body }) => (
                  <div key={n} className="flex gap-4 items-start">
                    <span
                      className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: "var(--primary)" }}
                      aria-hidden="true"
                    >
                      {n}
                    </span>
                    <div>
                      <p className="font-semibold text-[var(--text-primary)] text-sm mb-0.5">{head}</p>
                      <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/#body-scan"
                className="mt-2 mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold text-[var(--primary)] bg-[var(--background-light)] border border-[var(--border-color)] hover:border-[var(--primary)] transition-all"
              >
                <svg
                  viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className="w-4 h-4"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="3.5" />
                </svg>
                Tap to open Body Scan
              </Link>

              <blockquote className="mt-2 mb-6 pl-4 border-l-2 border-[var(--border-color)] text-[var(--text-secondary)] text-[14px] leading-relaxed">
                <strong className="text-[var(--text-primary)]">Tip:</strong>{" "}
                Many users enjoy playing soft noise or a gentle binaural beat quietly underneath
                the narration — pink noise, brown noise, or a delta or theta beat can deepen
                relaxation and mask environmental distractions. Keep the background volume low so
                the narrator&apos;s voice stays clearly in front. Both controls remain accessible
                at the top of the page and can be adjusted or turned off at any point.
              </blockquote>

              <div className="mt-6 pt-5 border-t border-[var(--border-color)]">
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  <strong className="text-[var(--text-primary)]">The science.</strong>{" "}
                  The evidence base for body scan and mindfulness meditation is substantial. A landmark
                  meta-analysis by Goyal et al. (2014), published in{" "}
                  <em>JAMA Internal Medicine</em>, reviewed 47 randomised controlled trials and found
                  that mindfulness meditation programmes — of which the body scan is a core element —
                  produce moderate improvements in anxiety, depression, and pain. The MBSR programme,
                  developed by Jon Kabat-Zinn at the{" "}
                  <a
                    href="https://www.umassmed.edu/cfm/mindfulness-based-programs/mbsr-courses/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--primary)] underline hover:opacity-75"
                  >
                    UMass Center for Mindfulness
                  </a>
                  , has been widely replicated in clinical settings worldwide. The full Goyal et al.
                  meta-analysis is freely available via{" "}
                  <a
                    href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4142584/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--primary)] underline hover:opacity-75"
                  >
                    NIH PubMed Central
                  </a>
                  .
                </p>
              </div>
            </div>

            <hr className="border-[var(--border-color)]" />

            {/* Aromatherapy */}
            <div id="aromatherapy" className="scroll-mt-24 bg-[var(--background-card)] rounded-2xl p-8 border border-[var(--border-color)]">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">🌿 Aromatherapy Pairing</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                Above the player you&apos;ll see an <strong className="text-[var(--text-primary)]">Aromatherapy Pairing</strong> card
                that updates as you browse tracks. Each suggestion pairs a specific essential oil with the session you&apos;re about
                to play — certain scents have well-documented effects on alertness, calm, and sleep that complement the audio.
                It&apos;s entirely optional; the audio works perfectly without it.
              </p>

              <ul className="space-y-4 text-[var(--text-secondary)] leading-relaxed mb-4">
                <li>
                  <strong className="text-[var(--text-primary)]">Electric diffuser.</strong>{" "}
                  Add two or three drops of the recommended oil to your diffuser and switch it on
                  two to three minutes before pressing play. This gives the scent time to spread
                  through the room so it&apos;s already present when your session starts.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Candle (tea-light) diffuser.</strong>{" "}
                  Light the tea-light and add two to three drops of oil to the water in the dish.
                  Allow three to five minutes for the heat to release the scent before starting
                  your session. Never leave a candle diffuser unattended, and keep it away from
                  anything flammable.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">No diffuser.</strong>{" "}
                  Place one drop on your wrists or the back of your hands, rub together gently,
                  and cup your hands over your nose for a few slow breaths before pressing play.
                  Always use a carrier oil (such as coconut or jojoba) if applying directly to skin,
                  and avoid contact with eyes.
                </li>
              </ul>

              <p className="text-[var(--text-secondary)] text-[14px] leading-relaxed">
                The pairing card can be turned off at any time in{" "}
                <strong className="text-[var(--text-primary)]">Settings → Personalisation → Aromatherapy suggestions</strong>.
              </p>

              <Link
                href="/#aromatherapy-pairing"
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold text-[var(--primary)] bg-[var(--background-light)] border border-[var(--border-color)] hover:border-[var(--primary)] transition-all"
              >
                <svg
                  viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className="w-4 h-4"
                  aria-hidden="true"
                >
                  <path d="M11 5 6 9H2v6h4l5 4V5z" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
                Tap to try Aromatherapy with Binaural Beats
              </Link>

              <div className="mt-6 pt-5 border-t border-[var(--border-color)]">
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  <strong className="text-[var(--text-primary)]">The science.</strong>{" "}
                  Aromatherapy works through olfaction — inhaled scent molecules activate receptors
                  in the nasal epithelium that send signals directly to the limbic system, the
                  brain&apos;s emotional and memory centre, and the hypothalamus, which regulates
                  heart rate, blood pressure, and stress hormones. Unlike most other sensory inputs,
                  smell has a direct anatomical pathway to these structures, which is why scent can
                  produce fast, involuntary mood and physiological responses. Lavender is the most
                  extensively studied essential oil: a review by Koulivand et al. (2013), published
                  in <em>Evidence-Based Complementary and Alternative Medicine</em>, found robust
                  evidence that lavender reduces anxiety, improves sleep quality, and exerts a
                  calming effect on the central nervous system without significant side effects.
                  Effects vary between oils — peppermint and lemongrass tend to be alertness-enhancing,
                  while chamomile and bergamot lean calming — which is why each audio session is
                  paired with an oil matched to its intended effect. The Koulivand et al. review is
                  freely available via{" "}
                  <a
                    href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3612440/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--primary)] underline hover:opacity-75"
                  >
                    NIH PubMed Central
                  </a>
                  .
                </p>
              </div>
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
                  Pick a background sound — Brown Noise, Pink Noise, White Noise, or Heavy Rain work well —
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

            {/* Make CRUX Yours */}
            <div className="bg-[var(--background-card)] rounded-2xl p-8 border border-[var(--border-color)]">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">⭐ Make CRUX Yours</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-5">
                CRUX remembers your preferences so you spend less time setting things up and more time actually using it.
              </p>
              <ul className="space-y-4 text-[var(--text-secondary)] leading-relaxed">
                <li>
                  <strong className="text-[var(--text-primary)]">Favourite beats and noises.</strong>{" "}
                  Tap the <span className="font-semibold text-[var(--text-primary)]">♥ heart</span> on any
                  beat card in the Audio Library, or on any noise card in Noise Therapy, to mark it as a
                  favourite. Favourites float to the top of each list automatically.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Set what CRUX opens with.</strong>{" "}
                  Your last-used beat and noise are remembered automatically. To pin a specific
                  starting point instead, open{" "}
                  <Link href="/settings" className="underline underline-offset-2 text-[var(--primary)] hover:opacity-80">Settings</Link>{" "}
                  and choose your default beat, noise, and volume under{" "}
                  <span className="font-semibold text-[var(--text-primary)]">My Defaults</span>.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Choose your launch screen.</strong>{" "}
                  In <Link href="/settings" className="underline underline-offset-2 text-[var(--primary)] hover:opacity-80">Settings</Link>,
                  set the <span className="font-semibold text-[var(--text-primary)]">Launch screen</span> to
                  open straight to the player or the library — no scrolling required.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Choose a colour theme.</strong>{" "}
                  The Appearance section in Settings offers four colour schemes — Air Force, Army,
                  Midnight, and Navy — each inspired by an Australian Defence Force branch. Pick
                  whichever suits your environment or personal preference.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Adjust brightness.</strong>{" "}
                  The Brightness control in Settings dims or brightens the entire interface — useful for
                  low-light environments or before bed.
                </li>
              </ul>
              <blockquote className="mt-5 pl-4 border-l-2 border-[var(--border-color)] text-[var(--text-secondary)] text-[14px] leading-relaxed">
                <strong className="text-[var(--text-primary)]">Everything saves automatically.</strong>{" "}
                There is no save button. Close the app, come back later — your defaults will be waiting.
              </blockquote>
            </div>

            <hr className="border-[var(--border-color)]" />

            {/* Save to Your Device */}
            <div className="bg-[var(--background-card)] rounded-2xl p-8 border border-[var(--border-color)]">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">📲 Save CRUX to Your Device</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
                CRUX can be installed like a regular app — no app store required. Once installed,
                it opens in its own full-screen window, works offline, and your settings are always
                waiting for you exactly where you left them.
              </p>

              <div className="space-y-4">

                {/* iPhone / iPad */}
                <div className="rounded-xl border border-[var(--border-color)] bg-[var(--background-light)] p-5">
                  <p className="font-bold text-[var(--text-primary)] mb-3">iPhone &amp; iPad (Safari)</p>
                  <ol className="space-y-2 text-[var(--text-secondary)] text-[14px] leading-relaxed list-decimal list-outside pl-5">
                    <li>Open CRUX in <strong className="text-[var(--text-primary)]">Safari</strong> — this does not work in Chrome or Firefox on iOS.</li>
                    <li>Tap the <strong className="text-[var(--text-primary)]">Share</strong> button at the bottom of the screen (the box with an arrow pointing up).</li>
                    <li>Scroll down in the share sheet and tap <strong className="text-[var(--text-primary)]">Add to Home Screen</strong>.</li>
                    <li>Give it a name (or leave it as-is) and tap <strong className="text-[var(--text-primary)]">Add</strong> in the top-right corner.</li>
                  </ol>
                  <p className="text-[var(--text-secondary)] text-[13px] mt-3 pl-0">
                    The CRUX icon will appear on your home screen. Tap it to open — it launches without any browser bars.
                  </p>
                </div>

                {/* Android */}
                <div className="rounded-xl border border-[var(--border-color)] bg-[var(--background-light)] p-5">
                  <p className="font-bold text-[var(--text-primary)] mb-3">Android (Chrome)</p>
                  <ol className="space-y-2 text-[var(--text-secondary)] text-[14px] leading-relaxed list-decimal list-outside pl-5">
                    <li>Open CRUX in <strong className="text-[var(--text-primary)]">Chrome</strong>.</li>
                    <li>Tap the <strong className="text-[var(--text-primary)]">three-dot menu</strong> (⋮) in the top-right corner of the browser.</li>
                    <li>Tap <strong className="text-[var(--text-primary)]">Add to Home screen</strong> or <strong className="text-[var(--text-primary)]">Install app</strong> — the exact wording depends on your Android version.</li>
                    <li>Tap <strong className="text-[var(--text-primary)]">Add</strong> when prompted.</li>
                  </ol>
                  <p className="text-[var(--text-secondary)] text-[13px] mt-3">
                    Some Android versions will show a pop-up banner at the bottom of the screen asking if you want to install — you can tap that instead.
                  </p>
                </div>

                {/* Desktop */}
                <div className="rounded-xl border border-[var(--border-color)] bg-[var(--background-light)] p-5">
                  <p className="font-bold text-[var(--text-primary)] mb-3">Desktop — Chrome or Edge</p>
                  <ol className="space-y-2 text-[var(--text-secondary)] text-[14px] leading-relaxed list-decimal list-outside pl-5">
                    <li>Open CRUX in <strong className="text-[var(--text-primary)]">Chrome</strong> or <strong className="text-[var(--text-primary)]">Edge</strong>.</li>
                    <li>Look for the <strong className="text-[var(--text-primary)]">install icon</strong> on the right side of the address bar — it looks like a screen with a download arrow, or a circle with a plus sign (⊕).</li>
                    <li>Click it and then click <strong className="text-[var(--text-primary)]">Install</strong>.</li>
                  </ol>
                  <p className="text-[var(--text-secondary)] text-[13px] mt-3">
                    If you don&apos;t see the icon, open the browser menu and look for <strong className="text-[var(--text-primary)]">Save and share</strong> → <strong className="text-[var(--text-primary)]">Install page as app</strong>.
                  </p>
                </div>

              </div>

              <blockquote className="mt-6 pl-4 border-l-2 border-[var(--border-color)] text-[var(--text-secondary)] text-[14px] leading-relaxed">
                <strong className="text-[var(--text-primary)]">Your settings stay private to your device.</strong>{" "}
                Everything is stored locally in your browser — nothing is sent to any server, and no one
                else who uses the same link will ever see your preferences.
              </blockquote>
            </div>

            <hr className="border-[var(--border-color)]" />

            {/* Safety */}
            <div
              className="bg-[var(--background-card)] rounded-2xl p-8 border"
              style={{ borderColor: "rgba(220, 38, 38, 0.25)" }}
            >
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">⚠️ Safety Information</h2>
              <ul className="space-y-3 text-[var(--text-secondary)] leading-relaxed mb-6">
                <li>
                  <strong className="text-[var(--text-primary)]">Not medical advice.</strong>{" "}
                  CRUX is a wellness tool, not a medical device. It does not replace professional
                  mental health care.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Do not use while driving or operating machinery.</strong>{" "}
                  Binaural beats and guided breathing are designed to relax and alter your mental
                  state — always use CRUX in a safe, stationary environment.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Keep the volume comfortable.</strong>{" "}
                  Set your device to a low level before pressing play. Prolonged exposure to
                  high-volume audio can cause permanent hearing damage.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Epilepsy and seizure disorders.</strong>{" "}
                  Do not use binaural beats without first consulting your doctor if you have
                  epilepsy, a history of seizures, or any neurological condition.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Stop immediately</strong> if you
                  experience discomfort, dizziness, or heightened anxiety.
                </li>
              </ul>

              <p className="text-[var(--text-secondary)] text-[14px] font-semibold mb-3">
                If you or someone you know is in crisis, help is available 24/7:
              </p>
              <ul className="space-y-2 text-[14px] text-[var(--text-secondary)]">
                <li className="flex flex-wrap justify-between gap-x-4">
                  <span>Lifeline</span>
                  <a href="tel:131114" className="text-[var(--primary)] underline underline-offset-2 hover:opacity-80 whitespace-nowrap font-semibold">13 11 14</a>
                </li>
                <li className="flex flex-wrap justify-between gap-x-4">
                  <span>Open Arms Veterans &amp; Families Counselling</span>
                  <a href="tel:1800011046" className="text-[var(--primary)] underline underline-offset-2 hover:opacity-80 whitespace-nowrap font-semibold">1800 011 046</a>
                </li>
                <li className="flex flex-wrap justify-between gap-x-4">
                  <span>Beyond Blue</span>
                  <a href="tel:1300224636" className="text-[var(--primary)] underline underline-offset-2 hover:opacity-80 whitespace-nowrap font-semibold">1300 22 4636</a>
                </li>
                <li className="flex flex-wrap justify-between gap-x-4">
                  <span>Emergency services</span>
                  <a href="tel:000" className="text-[var(--primary)] underline underline-offset-2 hover:opacity-80 whitespace-nowrap font-semibold">000</a>
                </li>
              </ul>

              <p className="mt-4 text-[13px] text-[var(--text-secondary)]">
                See our full{" "}
                <Link href="/disclaimer" className="underline underline-offset-2 hover:opacity-80">
                  Disclaimer
                </Link>{" "}
                for complete safety and liability information.
              </p>
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
