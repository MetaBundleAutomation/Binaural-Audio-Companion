"use client";

import { useState } from "react";
import BrainMap from "./BrainMap";
import LoopDiagram from "./LoopDiagram";

// A collapsible "Tell me more" block. Collapsed by default so the page can be
// skimmed in ~90 seconds — important for an audience whose concentration is
// exactly what this page describes as impaired.
function TellMeMore({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-5">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold text-[var(--primary)] bg-[var(--background-light)] border border-[var(--border-color)] hover:border-[var(--primary)] transition-all cursor-pointer"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-90" : ""}`}
          aria-hidden="true"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
        {open ? "Show less" : "Tell me more"}
      </button>

      {open && (
        <div className="mt-5 pl-5 border-l-2 border-[var(--border-color)] flex flex-col gap-4 text-[15px] leading-relaxed text-[var(--text-secondary)]">
          {children}
        </div>
      )}
    </div>
  );
}

// One numbered section. `alwaysOpen` sections have no collapse — the loop and the
// good news should never be hidden behind a tap.
function Part({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl p-7 border border-[var(--border-color)] bg-[var(--background-light)]">
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-[13px] font-bold tracking-widest text-[var(--primary)]">
          {number}
        </span>
        <h3 className="text-[22px] font-bold tracking-tight text-[var(--text-primary)]">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

// The italic one-liner that closes most sections — the line we want people to
// remember if they read nothing else in that section.
function Punchline({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 text-[15px] italic leading-relaxed text-[var(--primary)]">
      {children}
    </p>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[16px] leading-relaxed text-[var(--text-primary)]">
      {children}
    </p>
  );
}

export default function BrainScience() {
  return (
    <section id="brain-science" className="my-16 scroll-mt-24">
      <div
        className="rounded-3xl p-10 border border-[var(--border-color)] bg-[var(--background-card)]"
        style={{ boxShadow: "var(--shadow-lg)" }}
      >
        <h2 className="text-[32px] font-bold mb-3 tracking-tight text-[var(--text-primary)] text-center">
          What&apos;s happening in your brain
        </h2>
        <p className="text-center text-[15px] text-[var(--text-secondary)] mb-8">
          No jargon. No blame. Just the mechanics.
        </p>

        {/* Summary box — for anyone who reads nothing else */}
        <div className="rounded-2xl px-7 py-6 mb-8 border-2 border-[var(--primary)] bg-[var(--background-light)]">
          <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--primary)] mb-2">
            In one paragraph
          </div>
          <p className="text-[17px] font-semibold leading-relaxed text-[var(--text-primary)]">
            Four parts of your brain got stuck in a circle that feeds itself.
            It&apos;s an injury, not a weakness — and circuits can change.
          </p>
        </div>

        <div className="mb-10 flex flex-col gap-4">
          <Body>
            If you&apos;ve been through trauma, or you&apos;ve been in pain a
            long time, your brain has changed. That&apos;s not weakness and
            it&apos;s not in your head. It&apos;s a working system that took
            damage and adapted — the way a knee adapts after an injury.
          </Body>
          <Body>Here&apos;s what changed, and why it feels the way it does.</Body>
        </div>

        <div className="flex flex-col gap-5">

          <Part number="01" title="Why it's worst at 3am">
            <Body>
              When you&apos;re busy, you&apos;re mostly alright. The minute you
              stop, it starts.
            </Body>
            <Punchline>
              So when you say &ldquo;I&apos;m fine until I sit down&rdquo; —
              you&apos;re describing something real and measurable.
            </Punchline>
            <TellMeMore>
              <p>
                Your brain has a background setting — the hum that runs when
                you&apos;re not doing anything. Normally it&apos;s daydreaming,
                planning the weekend, drifting.
              </p>
              <p>
                After trauma, that hum gets taken over. Instead of drifting, it
                scans for threat and re-runs the worst of it. Research finds
                this network disrupted in PTSD, tipped towards rumination and
                replaying trauma.
              </p>
              <p>
                It&apos;s not that you&apos;ve got too much time to think.
                It&apos;s that the idle setting itself has changed.
              </p>
            </TellMeMore>
          </Part>

          <Part number="02" title="The smoke alarm">
            <Body>
              One small part of your brain has a single job: spot danger fast.
              It doesn&apos;t think — it just goes off.
            </Body>
            <Body>
              Yours got turned up to maximum, and the dial jammed.
            </Body>
            <Punchline>
              You&apos;re not overreacting. The alarm is set too fine.
            </Punchline>
            <TellMeMore>
              <p>
                A good smoke alarm is meant to be sensitive. That&apos;s the
                design. But now burnt toast brings the fire brigade.
              </p>
              <p>
                A door slams, a car backfires, someone stands too close behind
                you — and your whole body is on before your mind has caught up.
                Heart going, shoulders up, eyes scanning.
              </p>
              <p>
                That gap between your body reacting and your mind catching up is
                the alarm doing its job faster than thought. It was never under
                your control. It isn&apos;t now.
              </p>
              <p className="text-[13px]">Everyday name: the amygdala.</p>
            </TellMeMore>
          </Part>

          <Part number="03" title="The filing clerk">
            <Body>
              Another part does your filing. Every memory gets a date and a place
              stamped on it, so when it comes back, your body knows: that was
              then, not now.
            </Body>
            <Body>
              Trauma and long-term pain both knock this clerk about. Scans show
              this part actually gets smaller.
            </Body>
            <Punchline>
              That&apos;s why a flashback doesn&apos;t feel like remembering. It
              feels like happening.
            </Punchline>
            <TellMeMore>
              <p>
                When the filing fails, the stamp is missing. The memory
                doesn&apos;t arrive labelled &ldquo;four years ago&rdquo;. It
                arrives as now — same heart rate, same sweat, same urge to move.
              </p>
              <p>
                This is also why your memory has gone patchy, why you walk into
                rooms and forget why you&apos;re there, why names drop out
                mid-sentence. Same clerk, same overload. It isn&apos;t early
                dementia and it isn&apos;t you going soft.
              </p>
              <p className="text-[13px]">Everyday name: the hippocampus.</p>
            </TellMeMore>
          </Part>

          <Part number="04" title="The calm supervisor">
            <Body>
              The front of your brain is the sensible one. Its job is to walk
              over to the alarm and turn it down.
            </Body>
            <Body>
              Here&apos;s the cruel part. When the alarm is screaming hardest,
              this is exactly when the supervisor goes quiet.
            </Body>
            <Punchline>
              That&apos;s why &ldquo;just think about it logically&rdquo; is
              useless advice in the middle of it.
            </Punchline>
            <TellMeMore>
              <p>
                The research is consistent across study after study: alarm up,
                supervisor down. They move in opposite directions.
              </p>
              <p>
                So the one part of you that could talk you down is offline at the
                exact moment you need it. Not weak. Not absent. Offline.
              </p>
              <p>
                This is worth saying to the people around you, too. When someone
                tells you to calm down mid-episode, they&apos;re asking a part of
                your brain that isn&apos;t currently taking calls.
              </p>
              <p className="text-[13px]">Everyday name: the prefrontal cortex.</p>
            </TellMeMore>
          </Part>

          <Part number="05" title="The phone line">
            <BrainMap />
            <Body>
              None of these parts work alone. They&apos;re joined by a bundle of
              wiring — a phone line running between the alarm, the clerk and the
              supervisor.
            </Body>
            <Body>After trauma, that line is changed.</Body>
            <Punchline>
              Even if the supervisor came back online and tried to call — the
              message wouldn&apos;t land clean.
            </Punchline>
            <TellMeMore>
              <p>
                Studies keep finding this, in veterans and in civilians alike.
                It&apos;s one of the most consistent findings in the field and
                almost nobody mentions it.
              </p>
              <p>
                Worth being straight: the studies disagree on exactly how
                it&apos;s changed — some find the line weaker, some find it oddly
                stronger. What they agree on is that it&apos;s different. So
                &ldquo;changed wiring&rdquo; is the honest description, not
                &ldquo;damaged&rdquo;.
              </p>
              <p className="text-[13px]">Everyday name: the cingulum.</p>
            </TellMeMore>
          </Part>

          {/* The loop — the hero section. Never collapsed. */}
          <div
            className="rounded-2xl p-8 border-2 border-[var(--primary)] bg-[var(--background-light)]"
            style={{ boxShadow: "var(--shadow-lg)" }}
          >
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-[13px] font-bold tracking-widest text-[var(--primary)]">
                06
              </span>
              <h3 className="text-[26px] font-bold tracking-tight text-[var(--text-primary)]">
                The loop
              </h3>
            </div>

            <div className="flex flex-col gap-4">
              <Body>
                Here&apos;s the part nobody explains, and it&apos;s the part that
                matters most.
              </Body>
              <p className="text-[19px] font-bold leading-relaxed text-[var(--text-primary)]">
                These four pieces form a circle that feeds itself.
              </p>
              <LoopDiagram />
              <Body>
                The alarm fires. The clerk can&apos;t stamp it &ldquo;years
                ago&rdquo;. The supervisor is offline. The phone line is poor, so
                the message wouldn&apos;t land anyway. Your body floods with
                stress chemicals — pounding heart, tight chest, ready to run.
              </Body>
              <Body>
                And the alarm reads all of that as proof it was right to fire.
              </Body>
              <Body>So it fires harder next time.</Body>
              <p className="text-[17px] font-bold leading-relaxed text-[var(--text-primary)]">
                That&apos;s the loop. It isn&apos;t you failing to get over it.
                It&apos;s a circuit that&apos;s wired itself to keep going.
              </p>
            </div>
          </div>

          {/* The good news — never collapsed either. */}
          <div className="rounded-2xl p-8 border border-[var(--border-color)] bg-[var(--background-light)]">
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-[13px] font-bold tracking-widest text-[var(--primary)]">
                07
              </span>
              <h3 className="text-[22px] font-bold tracking-tight text-[var(--text-primary)]">
                The part that&apos;s actually good news
              </h3>
            </div>

            <div className="flex flex-col gap-4">
              <Body>
                Everything above describes a circuit. Circuits can change.
              </Body>
              <Body>
                This is the solid finding, not the hopeful one: trauma-focused
                therapy reduces symptoms and changes the underlying wiring. The
                alarm settles. The supervisor comes back. The clerk starts filing
                again.
              </Body>
              <p className="text-[19px] font-bold leading-relaxed text-[var(--primary)]">
                The brain that learned this can learn something else.
              </p>
            </div>
          </div>

          {/* Where the audio fits — the honesty section. */}
          <Part number="08" title="Where the audio fits — honestly">
            <Body>What this app does, and what it doesn&apos;t.</Body>
            <Body>
              It does not fix your amygdala. It isn&apos;t treatment and it
              won&apos;t replace therapy. Anyone telling you a soundtrack cures
              PTSD is selling something.
            </Body>
            <Body>
              What it can do is calm the body enough that the supervisor can get
              back in the room.
            </Body>
            <TellMeMore>
              <p>
                Across multiple published trials, binaural audio has been
                linked to reduced anxiety and pain. The evidence is real but
                still early — studies are small and don’t agree on everything.
              </p>
              <p>
                The researchers themselves rate the pain findings as low
                certainty. The anxiety findings are stronger but still varied a
                lot between studies.
              </p>
              <p>So: promising, not settled.</p>
            </TellMeMore>
            <div className="mt-5 flex flex-col gap-4">
              <Body>
                A steadying tool. Something to break the loop at step one, before
                the body floods. Used alongside real help, not instead of it.
              </Body>
              <Punchline>
                We&apos;d rather undersell this and be straight with you.
              </Punchline>
            </div>
          </Part>

        </div>

        {/* Crisis numbers */}
        <div className="mt-8 rounded-2xl px-7 py-6 border border-[var(--border-color)] bg-[var(--background-light)]">
          <div className="text-[13px] font-bold text-[var(--text-primary)] mb-3">
            If things are bad right now
          </div>
          <ul className="flex flex-col gap-2 text-[15px] text-[var(--text-secondary)]">
            <li>
              <span className="font-semibold text-[var(--text-primary)]">
                Open Arms
              </span>{" "}
              — veterans &amp; families, 24/7 — 1800 011 046
            </li>
            <li>
              <span className="font-semibold text-[var(--text-primary)]">
                Lifeline
              </span>{" "}
              — 13 11 14
            </li>
            <li>
              <span className="font-semibold text-[var(--text-primary)]">
                000
              </span>{" "}
              — in an emergency
            </li>
          </ul>
        </div>

      </div>
    </section>
  );
}