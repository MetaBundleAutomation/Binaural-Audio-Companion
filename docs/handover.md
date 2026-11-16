## 16 November 2026 (later): Conditions — Community Treatment Platform ported into the wheel

Goal (Les): bring Les's other two apps — **Community Treatment Platform (CTP)** and **IBS Compass** — into the crux-wheel mock-up, "essentially combining the two web apps into crux-wheel". This session did the **CTP half**. IBS is scoped but **not built yet** (see below). All of this is in the `wheel-mockup` branch only, DRAFT, preview-only — nowhere near `main`.

### Decisions made first (grilled through, Les said yes to all)
- **Placement:** Conditions are a **separate area, not a spoke**. The 8 spokes are lifestyle *approaches*; conditions are *diagnoses*. New entry tile below the wheel → `/explore/conditions`. The ring is untouched.
- **Audience:** all three CTP views kept — **Veteran / First responder / Clinician**, as a toggle. Default is **Veteran** (calm first; the doctor taps Clinician).
- **Fidelity:** faithful port into a **new condition data model** (not squeezed into the gentle TopicCard idiom). Clinical nuance (off-label, TGA scheduling, MBS items) preserved verbatim.
- **Source of truth:** this is a **dated snapshot** of CTP (16 Nov 2026) with a visible provenance note. CTP is where the doctor is reviewing this content; edits there will NOT flow here. Reconciling to one source is a **later decision** — do not assume they stay in sync.
- **Draft marking:** per-condition "Copied from CTP… Not yet clinically reviewed" line + the wheel's global DRAFT banner. `lastReviewed` is unset on every condition (never claim a review that hasn't happened).
- **Scope:** all **7** CTP conditions, including **Sexual Dysfunction** (Les: the doctor rates it as important as the others).
- **Evidence scale:** kept CTP's **4-level** scale for conditions (strong / promising / traditional / anecdotal), separate from the wheel's own 3-level scale.
- **Crisis:** reuse the one `/crisis` page. Added Suicide Call Back Service + Beyond Blue to it (real AU lines CTP already uses).
- **Cross-links:** condition↔condition kept; condition→spoke links added (e.g. Chronic Pain → Body & Pain, MDD → Movement). Spoke→condition left for later so the 8 lifestyle cards weren't touched.

### Finished (CTP)
- **All 7 conditions** ported as data: `src/lib/conditions.ts` — PTSD, Alcohol & Drug Use, MDD, Moral Injury, Chronic Pain / MSK Injury, Bruxism / OSA, Sexual Dysfunction. Each has clinician/veteran/firstResponder content (sections, evidence badges, referral pathways), key points per audience, sources (href where CTP's references page confirms a link, label-only otherwise), related conditions and related spokes. The doctor edits content **here** — no component code to touch.
- **`src/components/ConditionView.tsx`** (client): the Veteran/First responder/Clinician toggle and everything that changes with it. Selected tab is bold + underlined (not colour alone).
- **`src/components/ConditionEvidenceBadge.tsx`**: CTP's 4-level badge in CRUX tokens, dot **and** words.
- **Routes:** `src/app/explore/conditions/page.tsx` (index) and `src/app/explore/conditions/[slug]/page.tsx` (one page per condition, static-generated).
- **`src/app/explore/page.tsx`**: a "Conditions — for veterans & first responders" entry tile added **below** the wheel. Ring unchanged.
- **`src/lib/nav.ts`**: Suicide Call Back Service + Beyond Blue added to `CRISIS_LINES`.
- **Honoured CTP's content rules:** the word **"addiction" never appears** in any user-facing text or in a URL (`/explore/conditions/alcohol-and-drug-use`); Australian spelling; key points only restate page content.
- **Verified:** `npx tsc --noEmit` clean; `next build` → 37/37 pages, all 7 conditions prerendered; on a **production server** the Veteran↔Clinician toggle hydrates and switches, evidence badges and amber callouts render, clinical detail is faithful.

### In progress / not done
- **IBS Compass is NOT built yet.** It's scoped and waiting on 3 decisions (Les to answer next session):
  1. **Its own section** ("IBS / Gut health", a second tile below the wheel), *not* a card in the Conditions list — recommended, because IBS is single-audience and multi-topic and has no clinician/first-responder split.
  2. **Content topics only** — Treatments, Diet, Alternatives, Mental Health, Doctor Questions. **Skip** the Mindfulness audio page (overlaps CRUX's own tools) and the AI Assistant (needs an Anthropic API key + rate-limiting infra).
  3. **Keep each IBS topic's own evidence system** (Treatments group by stage; Alternatives Tier 1–4; Diet A–F) rather than forcing one scale — the gradings were calibrated for honesty.
  - IBS is single-audience ("people managing IBS", not "patients"), AU-localised, all-draft. Source files: `/home/les/dev/ibs-compass`, clean data in `lib/treatments.ts`; diet/alternatives arrays are co-located in their page `.tsx` and need lifting out.
- **Not committed to or near `main`.** CTP source lives at `/home/les/dev/community-treatment-platform`.

### What didn't work / watch-outs
- **Local `pnpm dev` HMR is broken app-wide.** Next 15.5.28's `static-paths-worker` throws `Cannot find module './vendor-chunks/@supabase+auth-js@2.118.0.js'` and the client bundle 404s — this hits **untouched** pages (`/`, `/explore/sleep`) too, so it's a pre-existing dependency/pnpm issue, **not** these changes. `next build` and `next start` are completely fine (that's how the work was verified), so **Vercel deploys build normally**. Worth a clean `pnpm install` / dependency look when someone has time.
- **Snapshot drift:** the conditions here are a copy. If the doctor edits CTP, this won't update on its own, and could show the doctor a stale version of their own words. The provenance note says so; decide single-source later.
- **Still unreviewed medical content.** Before any of this goes beyond the doctor-review preview it needs a named clinical reviewer — same rule as the rest of the wheel.

### Next
- Les: answer the 3 IBS questions, then build IBS "the same way" (its own section).
- Decide with the clinic/doctor whether CRUX and CTP should share one source of truth for conditions, or stay separate snapshots.
- Later: spoke→condition back-links; consider porting CTP's linked references for the 4 conditions that are label-only here.

## 16 November 2026 — CRUX Wheel mock-up

This is a **separate working copy** for the "wheel" idea, so the live site is never at risk. It is a mock-up to show a doctor who specialises in veteran care. Nothing here is clinically reviewed; every health card is marked DRAFT on screen.

### Setup (so anyone can pick it up)
- Folder: `/home/les/dev/crux-wheel`, a fresh clone of the live repo on branch **`wheel-mockup`** (the local `main` branch was deleted here on purpose, so there is no way to push to live out of habit). The live site still deploys from `main` only.
- Runs on **port 3003** (`crux-wheel` entry in `/home/les/dev/.claude/launch.json`). On iPad: `http://192.168.8.206:3003/explore` (needs `sudo ufw allow from 192.168.8.0/24 to any port 3003 proto tcp` once, and the dev server running).
- `.env.local` here deliberately leaves out the Supabase keys, so the mock-up cannot touch the live chat Room or stats.
- Source briefs: `CRUX-wheel-mockup-build-brief.md`, `CRUX-wheel-design-brief.md`, `crux-wheel-plan.md` (in `~/Downloads`).

### Finished
- **Explore button** on the home page (`src/app/page.tsx`): one quiet card below the tool grid; nothing existing moved. The label lives in one constant, `WHEEL_LABEL` in `src/lib/wheel.ts`, so it is a one-word change to rename.
- **The wheel** (`src/app/explore/page.tsx`): CRUX in the centre (tap to return home) with eight spokes around it, joined by faint spoke lines. Phone-first, no sideways scroll, uses CRUX's own colour tokens. Spoke icons are in `src/components/WheelIcons.tsx` (kept separate from the nav icons so CRUX is untouched).
- **Eight spoke pages** (`src/app/explore/[spoke]/page.tsx`, one dynamic route): Food & Eating, Movement, Sleep & Light, Mind & Stress, Body & Pain, Supplements & Alternatives, Treatments & Getting Help, Connection & Support.
- **Reusable topic card** (`src/components/TopicCard.tsx`) with the full brief layout: short version → science + evidence badge → good points ✅ → watch-outs ⚠️ → who it may suit → quick tip → talk to your doctor → sources (collapsed). The three-level evidence badge (`src/components/EvidenceBadge.tsx`) uses a coloured dot **and** words, so it never relies on colour alone.
- **One draft example card per spoke**, all transcribed from the build brief. Supplements carries the standing "Check before you mix" safety note; Sleep, Mind and Body link back to CRUX's own tools (breathing, noise, brain section).
- **All card content is data** (`src/lib/topics.ts`). The doctor's edits go there — no component code to touch. Adding more topics to a spoke is just more entries in the same list.
- **Crisis page** (`src/app/crisis/page.tsx`): the "Need to talk to someone now?" link on the wheel and every spoke page goes here. Australian lines (Open Arms, Lifeline, 000) are the ones CRUX already uses; US/UK are a draft list marked "verify before launch". No number was invented.
- Patterns reused from Les's other apps: the evidence-badge idea and crisis-block style from **community-treatment-platform**, and the content shape (description / evidence / worth-knowing / ask-doctor) from **ibs-compass**.
- Verified: `npx tsc --noEmit` passes, no console errors, checked on phone (375px) and desktop.

### Deployed preview (16 Nov)
- **Public link to share with the doctor and Josh: https://crux-wheel.vercel.app** (opens to the wheel at `/explore`). No login needed.
- Deployed to a **separate Vercel project on Les's own account** (`les-projects-3f6a235d/crux-wheel`), not Josh's `metabundle` project, so it is fully under Les's control and nowhere near the live site.
- Branch `wheel-mockup` is pushed to GitHub. `vercel link` auto-connected Les's new project to the shared repo `MetaBundleAutomation/Binaural-Audio-Companion`, so Les's project will now also build on pushes to that repo (a separate URL — it does **not** touch crux.metabundle.ai, which is Josh's project deploying from `main`). Disconnect in the Vercel project's Git settings if unwanted.
- **Not indexed by search engines:** the project has `NEXT_PUBLIC_ALLOW_INDEXING=false` set, which turns on `noindex`/`nofollow` and a `Disallow: /` robots.txt (see `src/app/layout.tsx` and `src/app/robots.ts`). The flag is unset on the live site, so `main` stays indexable.
- Josh's `metabundle` preview also exists (`binaural-audio-companion-git-wheel-mockup-metabundle.vercel.app`) but is behind Vercel login — Josh can view it, the doctor cannot. The crux-wheel.vercel.app link above is the one to send.

### In progress / not done
- Not yet seen on the iPad or by the doctor.
- The existing CRUX was not changed, apart from the env-gated `noindex` safeguard in `layout.tsx`/`robots.ts` (off on live). No nav/sidebar/wording changes.
- **Before the wheel ever goes to the live site:** remove or leave `NEXT_PUBLIC_ALLOW_INDEXING` unset so the real pages can be indexed.

### What didn't work / watch-outs
- The build brief's path `~/projects/binaural-audio-companion` is old; work now lives under `/home/les/dev`.
- `crux-wheel-plan.md` says the brain-science section is "built locally, not yet pushed", but it is already live on `main`, so Mind & Stress reuses it as-is.
- The live repo's `main` is **not** branch-protected and Les's account has admin, so a stray push from a `main` checkout could reach veterans. Deleting local `main` here is the guard; turning on GitHub branch protection (Josh + Les) would be belt-and-braces.

### Next
- Les: view on iPad, then show the doctor to react to shape, tone and content.
- Doctor review per spoke; edits go in `src/lib/topics.ts`. Only add a "reviewed" marker once a section is actually signed off.
- When ready: push `wheel-mockup` for a Vercel preview link (confirm with Les first).
- Later, per the brief: pelvic-health card from Phoebe Armfield (needs her article + written consent), a practitioner-articles area, an audio library, and outward links to IBD/IBS Compass and the Community Treatment Platform.
- Final name for the wheel (working name "Explore") and verified crisis numbers per country before anything goes live.
- Handover to Josh once the doctor approves.

## 17 October 2026

### Finished
- Added a "Screen off? No problem." bullet to the Noise Therapy list on the Instructions page (`src/app/instructions/page.tsx`), after the Auto-sync bullet
- Added a bold line to the Noise Therapy card (`src/components/NoiseGenerator.tsx`): "Sound keeps playing when your device's screen is off". It sits under the "Tap to learn" button and above the sound tiles. It was made larger, brighter and bolder (text-base, font-semibold, primary text colour) so stressed veterans don't miss it
- Pushed to GitHub with the message "Add screen-off note to Instructions and Noise Therapy card"
- Phone test passed: the sound kept playing after the screen was turned off

### In progress
- The new text had not shown on the live site yet. It is waiting on the Vercel build. Josh needs to check that the latest deployment on his Vercel account says Ready
- Once live: close the app fully, reopen it, and look for the bold line on the Noise Therapy card (on a computer, Ctrl+Shift+R)
- The same commit also included the Next.js update (15.5.18 to ^15.5.26) from an earlier session, which worked then. After this deploy, test the audio once more

### What didn't work
- The live address in CONTEXT.md, cruxthecoreofcalm.app, does not load. The real address is **mindflow.metabundle.ai**
- The first git push failed with "Could not resolve host: github.com" because the internet dropped. Running it again worked

### Next
- Fix CONTEXT.md: change the live address to mindflow.metabundle.ai and update the line saying Josh deploys (Les now has full control, but Vercel is still on Josh's account)
- Optional: add a short line to "Save CRUX to Your Device" on the Instructions page. Veterans see mindflow.metabundle.ai in the address bar when they first install, so it may help to say that this is CRUX
- Still parked: the 3 npm vulnerabilities (2 high, 1 critical). Fix carefully and test the audio afterwards

## 4 November 2026

### Finished
- Touched up the "Your Brain" section on the home page and added a quiz. The doctor's wording on the page was not changed. Everything is on the branch `feat/brain-quiz`, in a PR for review, not on `main`
- Cut the heavy padding on phones (`src/components/BrainScience.tsx`). At 375 px wide the text column went from 195 px to 251 px and the heading went from three lines to two
- Added a diagram of the loop inside part 06 (`src/components/LoopDiagram.tsx`): a ring from 640 px wide and up, a numbered list on phones. Screen readers get the list at every width
- Added "09 Quick check — did it land?" after part 08 (`src/components/BrainQuiz.tsx`, questions in `src/data/brainQuiz.ts`). Nine pick-everything-that's-true questions, and every option has its own response. The results card links back to the parts worth a re-read
- Moved the four brain parts into one shared file, `src/data/brainParts.ts`, used by BrainMap and the diagram
- BrainMap: the image now has its size set and loads lazily, legend names wrap instead of being cut off, and the credit line is a little bigger
- Every part now has a link target: `#brain-01` to `#brain-08`, and `#brain-quiz`
- Added a "why it feels this way" line to "Where would you like to start?" on the Instructions page
- Tested at 375 px, 640 px and desktop: every quiz state, all three result messages, a keyboard-only run, and contrast measured across all four themes and three brightness levels
- Added Vercel Web Analytics (`@vercel/analytics` in `src/app/layout.tsx`), merged to `main` as PR #4. Page views now show under Analytics in the Vercel dashboard
- Added usage events on top of that (`src/lib/analytics.ts`, `src/hooks/useToolTracking.ts`, `src/components/SessionTracker.tsx`). Each tool sends start, stop (with a length bucket) and a heartbeat every five minutes of use, twice over: a roll-up row (`tool_start`, `tool_5min`, `tool_stop`, split by the `tool` and `item` properties) and a row per tool and item (`binaural_focus_start`, `noise_heavyrain_5min`, `box_breathing_sarah_stop`, `body_scan_ben_start`, and so on). In the dashboard: count of a `_5min` row x 5 = minutes of playtime for that tool or track. The app sends `session_5min` and `session_end` the same way for time in the app, and the quiz sends `quiz_start` and `quiz_complete` with the score. Nothing identifies a person; events carry at most two properties because that is the Vercel Pro limit
- Fixed the privacy sentence on the Instructions page, which said nothing is sent to any server. It now says preferences stay local and only anonymous usage is counted

### In progress
- The PR is open and not merged. Josh wants to look at the Vercel preview before it goes to `main`
- The PR lists a few "Content notes for review": places where the page's wording is stronger than the evidence. The page copy was left alone so Les and the doctor can decide

### What didn't work
- On Josh's PC, plain `pnpm` stops with "Failed to switch pnpm to v11.0.9". The global pnpm is 10.33.4 and can't launch the 11.0.9 that `package.json` pins. This also stops the `crux-dev` launch config. For this job I ran the 11.0.9 copy directly with `node` from `%LOCALAPPDATA%\pnpm\.tools\pnpm\`, and ran the dev server with `node node_modules/next/dist/bin/next dev`. Updating the global pnpm may fix it properly, but that has not been tried
- The first version of the selected-answer tint did nothing: two Tailwind background classes on one element, and the plain one won. Keep only one `bg-` class on an element
- Feedback lines that opened with "Spot on." read wrongly under the "One you missed" label, so those openers were removed. Each line now has to read properly under either label

### Next
- Les and the doctor: go through the content notes in the PR
- Optional: open "Tell me more" automatically when someone arrives from a re-read link. Some quiz answers (Q1 especially) are inside those collapsed blocks, so it takes one extra tap to find them
- `mindflow.metabundle.ai` now redirects to `crux.metabundle.ai`. CONTEXT.md still has the old address
- `docs/screenshots/brain-quiz/` is only there for the PR's before and after pictures. It can be deleted once the PR has been reviewed

## 5 November 2026

### Finished
- Named every usage event per tool and item as well (`binaural_focus_start`, `noise_heavyrain_5min`, `body_scan_ben_stop`...) so the Vercel Events panel lists each track, noise, voice, preset and narrator as its own row. Merged as PR #6
- Built "The room": a live chat on the home page, YouTube-live style. Every visitor gets a random name like "tired koala" (`src/lib/visitor.ts`, kept in the browser's localStorage with a random id). The chat is `src/components/LiveChat.tsx`, collapsed until someone taps "Join the room". Messages vanish after 24 hours. Guard rails: two messages per ten seconds, links / emails / phone numbers stripped, slurs masked (browser and database both), Hide and Report buttons, and the crisis lines pinned while the room is open (`src/lib/roomRules.ts`)
- Rebuilt the About page: a section about Josh (marked EDIT ME in `src/app/about/page.tsx`), live numbers (`src/components/LiveStats.tsx`: people here now, unique visitors over 7 / 30 / 90 days, hours listened, a visitors-per-day chart in `src/components/UsageChart.tsx`, top three most played), a Support CRUX section whose button appears once `NEXT_PUBLIC_DONATE_URL` is set, then the existing science sections
- All of it runs on one Supabase project. Schema, policies and the `live_stats()` function are in `supabase/migrations/20261105000000_live_room.sql`; setup steps in `supabase/README.md`. The browser only holds the public key. Until `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set on Vercel the room shows "opens soon" and the About page shows "Live numbers are being switched on", so the code is safe to ship first
- Visits and finished plays are also logged to Supabase (`SessionTracker`, `useToolTracking`) so the About page numbers come from our own table, not the Vercel API
- The GitHub FUNDING.yml still pointed at the upstream template author's Ko-fi; replaced with a commented placeholder

### In progress
- Josh to create the Supabase project, run the migration, and set the two env vars on Vercel (then redeploy). Also to set `NEXT_PUBLIC_DONATE_URL` once there is a donation page, and to rewrite the EDIT ME paragraphs on the About page in his own words

### What didn't work
- Nothing yet; the room could only be tested without a Supabase project (the "opens soon" state). First live test is after the env vars are set

### Next
- Decide how to moderate the room: for now the Report button just writes to the `reports` table and someone has to look in the Supabase dashboard (query in `supabase/README.md`). A tiny admin page is the obvious follow-up
- Turn on `pg_cron` in Supabase and schedule the cleanup at the bottom of the migration so old messages are deleted, not just hidden
- Consider a Settings toggle to hide the room entirely for people who don't want it

## 5 November 2026 (later): the Metabundle look

### Finished
- New look across the app, ported from Josh's own site source (metabundle.ai): near-black backgrounds with soft colour glows (`src/components/BackgroundFX.tsx`), translucent glass cards with hairline borders, gradient pill buttons, uppercase "eyebrow" pills above headings, and the Inter font. All of it lives in `src/app/globals.css` as CSS variables and shared classes (`card`, `btn-primary`, `btn-secondary`, `btn-ghost`, `eyebrow`, `glass`, `glass-strong`), so the four branch themes and three brightness levels in Settings still work; each theme now also has an accent gradient
- New navigation: a fixed sidebar on desktop (`src/components/Sidebar.tsx`) and a glass top bar with a hamburger drawer on phones (`src/components/TopBar.tsx`), both reading the same list in `src/lib/nav.ts`. `Header.tsx` is gone; `AppShell.tsx` wraps every page. The crisis numbers sit at the bottom of the sidebar and the drawer, and a "Support CRUX" button appears there once `NEXT_PUBLIC_DONATE_URL` is set
- Every section, page, button and card restyled to the new classes without touching behaviour or audio code

- One tool per page: `/binaural`, `/noise`, `/breathe` (Box + Coherence tabs), `/body-scan`, `/brain`, `/room`. The home page is now just the hero and the grid of tool cards. Audio keeps playing while you move around: the four audio tools are rendered by `src/components/ToolStage.tsx` inside the root layout (mounted the first time their page is opened, then kept hidden), and a small "Now playing" bar (`NowPlayingBar.tsx`) shows what is running with a link back to its page. `Player.tsx` was split into `BinauralPlayer.tsx` and `BreathingHost.tsx`
- The Settings "Launch screen" now opens a page instead of scrolling (`LaunchRedirect.tsx`, once per browser session) and gained a Body Scan option. Instructions deep links, the sitemap and the service worker precache list (`crux-v16`) know the new routes

### In progress
- Nothing; both halves of the overhaul are on `main`

### What didn't work
- Nothing blocking. The glass blur is switched off below 768 px on purpose (it repaints on every scroll frame on a weak phone GPU); the bar and drawer use a solid tint there instead

### Next
- Check the four themes on a real phone, especially Army and Midnight, where the glow colours are the least tested
- Consider a Settings toggle to hide the now-playing bar, and controls (pause / stop) on it, which would need the noise and breathing tools to expose a stop handle

## 5 November 2026 (evening): the clinic's colours

### Finished
- The default look now uses the partner clinic's colours, sampled from the clinic's website (Les has the details): charcoal slate backgrounds, a vivid green accent, white text. It is a new default theme called "Slate" in `src/app/globals.css`. Navy is now a normal theme you pick in Settings (class `theme-navy`), next to Army, Air Force and Midnight. Anyone who had already picked a theme keeps it; everyone else sees Slate
- Page and section headings (h1 and h2) are set in a condensed uppercase face like the clinic's, and body text is DM Sans, the text font on the clinic's site. Both load through `next/font` in `src/app/layout.tsx`. The clinic's own heading font is a paid one, so Barlow Condensed stands in for it. The rule is near the top of `globals.css`, outside the Tailwind layers on purpose so it beats the `tracking-tight` class on headings
- Filled buttons and accent chips take their text colour from a new `--on-accent` variable: dark on the clinic green, white on the branch themes. The background glows are turned down on Slate with `--fx-opacity`
- The browser theme colour, the manifest and the share image use the new slate

### In progress
- Nothing

### What didn't work
- The first Bright level let the green drop to 3.8:1 as text on cards. Bright now uses a slightly lighter green and a slightly darker slate, which measures 4.8:1. Text, secondary text and the green were measured at all three brightness levels

### Next
- The clinic's name and logo are not on the site or in this repo (the repo is public). That needs the clinic's say-so first
- The app icon (Southern Cross on navy) was left as it is
- If the uppercase headings are not wanted, revert the commit "Clinic-style headings and body font" on its own; the colours stay
- Check Slate on a real phone at night. It is lighter than Navy was; Dim in Settings gives the darker slate

## 5 November 2026 (night): readability and accessibility pass

Josh found the new Slate colours a little hard to read, and reminded us who uses CRUX: people with poor eyesight, PTSD and possibly epilepsy. So the colours were redone by measurement, not by eye.

### Finished
- Every piece of text on all eleven pages now measures at least 7:1 contrast (WCAG AAA), in all five themes and at Dim, Default and Bright. Before this, Slate body and card text sat between 5.6 and 6.4, the footer small print fell to 3.4, and the older themes dropped to 3.2 on Bright
- Slate is now the clinic's darker slate (#161F24) as the page. Buttons keep the clinic green (#00D084); green used as text is a lighter tint of it (#6BE8BB) because the pure green is not readable enough as small text. The background colour haze is off on Slate and halved on the other themes, since it sat behind text
- Navy, Army, Air Force and Midnight got lighter text tints and deeper button gradients, so white button labels also reach 7:1
- Nothing is smaller than 12px any more (labels were 9.5 to 11px) and no text is faded with opacity
- A card inside a card no longer gets lighter with each layer (`.card .card` in `src/app/globals.css`). Stacked see-through panels were what dragged contrast down on the Your Brain page
- Track cards are darker so their white titles read (they were pale with white text, 3.6:1). Noise tile taglines stay in the normal text colour. The loop diagram's numbers are light on a dark chip with a coloured ring. Names in the room use lighter tints. Switches use a deeper track when on, so the white knob stands out
- The phone menu and top bar are fully solid. They were 6% see-through, which put the page heading faintly behind the menu links
- Reduced motion: if the device's "reduce motion" setting is on, Body Scan uses its narration-only version, the fullscreen nature video shows its still image, and the pure-tone wave holds still. Box and coherence breathing already respected the setting
- Seizure safety check. Nothing in the interface flashes: the fastest animation is the five small equaliser bars on a playing track, under one cycle a second and a few pixels wide. The three nature videos were measured frame by frame in the browser against the WCAG "three flashes" rule (flicker faster than three times a second over a quarter of a 10-degree area fails). Running water: at most 1.1% of the frame flickers that fast, worst area 6.3% against the 25% limit. Tropical beach: 0.13% and 1.2%. Beach sunrise: none. Whole-picture brightness never jumped more than 0.5% between frames

### In progress
- Nothing

### What didn't work
- Measuring by the colour variables alone missed the real problems. Text sits on stacked see-through layers, so the check has to walk the rendered page and add the layers up. The first pass also read colours mid-transition after switching brightness, which gave false failures until transitions were switched off for the measurement
- The first Bright level was too light to hold 7:1 on nested panels with any sensible text colour, so Bright is now only a step lighter than Default

### Next
- The faded preview cards either side of the selected track are below 7:1 on purpose (they are previews); they reach full contrast when centred
- Not measured: text drawn on the breathing canvases, text over the Body Scan video, hover states. Worth a look on a real phone
- The video check sampled 30 frames a second on a coarse grid and covered about half of two of the videos. It is a screening check, not a certified photosensitivity (Harding) test
- Good follow-ups: an Accessibility section in Settings (reduce motion, larger text) for people who do not know their device has those settings; transcripts for the guided audio; bigger touch targets on the small round buttons
- Keep the rule: before changing a colour, measure it. The comment at the top of the Slate block in `globals.css` says what has to hold

## 6 November 2026: Instructions buttons that did not jump to their section

Josh found that the "Instructions" button on Binaural Beats opens the Instructions page at the right section, but the one on Breathing did not.

### Finished
- The Instructions buttons on Box Breathing, Coherence and Body Scan opened the Instructions page but left it at the top. Binaural Beats, Noise Therapy and the aromatherapy card were fine. All six now land on their own section, on desktop and on a phone
- Cause: the four audio tools stay in the page, hidden, after their first visit (`src/components/ToolStage.tsx`), so sound keeps playing between pages. Three of them used the same `id` as their section on the Instructions page (`box-breathing`, `coherence-breathing`, `body-scan`). A link such as `/instructions#body-scan` goes to the first element with that id, which was the hidden tool, so nothing moved
- Knock-on effect, also fixed: after one of those failed jumps, pages opened from the menu stopped going to the top. Coming from far down a long page, Binaural Beats, Noise Therapy and Breathing opened at their footer
- The tool sections now use ids ending in `-tool`. The ids on the Instructions page are unchanged, so links people have saved still work
- "Tap to try Coherence Breathing" on the Instructions page opened the Box Breathing tab if Breathing had already been visited. It now opens the Coherence tab (`src/components/BreathingHost.tsx`)

### In progress
- Nothing

### What didn't work
- Nothing was wrong with the links themselves, which is why it was hard to see. The addresses were right; the page had two elements with the same id

### Next
- Rule for new work: an `id` inside a tool (Binaural Beats, Noise Therapy, Breathing, Body Scan) must not be used anywhere else in the app. There is a note at the top of `ToolStage.tsx`

## 7 November 2026: rolled back to CRUX as veterans know it

On 6 November the home page became a library of features, a guide chat was added, the app was renamed, and Les's other apps were brought inside it. Les raised three worries: veterans already use CRUX and this made it too complicated, the medical content in the other apps needs expert review before it goes live, and it should have waited for the conversation with the clinic. Josh asked for it to be rolled back.

### Finished
- The live site is CRUX again, as it was after the clinic colours went in: the same home page and menu, the four tools, Your Brain, Instructions, the room, About and Settings
- Kept: the readability pass (5 November, night) and the fix for the Instructions buttons (6 November). Both are fixes to what was already there, not new features
- Taken off the live site: the library home screen, Ask (the guide chat), the new name, Bill Toolkit, Doctor Questions, Help Now, and the pages for the other apps
- Nothing was thrown away. All of it is on the branch `parked/platform-hub`, and in pull requests 15, 16 and 17

### In progress
- Nothing

### What didn't work
- Big changes to what veterans see went straight to the live site in one afternoon, ahead of the conversation with the clinic. Changes of that size should go to a preview link first and wait for a yes

### Next
- Decide with the clinic what, if anything, comes back from the parked branch, and in what order
- Any medical content from the other apps needs a named clinical reviewer before it is shown to anyone
- People who installed the app during those few hours may see "CTEP" under the icon until they remove it and add it again
- The offline cache name is back to `crux-v16`. That is fine: phones pick up the change because the file itself is different

## 16 November 2026: the home page links, and a "CRUX in numbers" page

### Finished
- Tapping a card on the home page, or Start listening, no longer reloads the app, so sound keeps playing (pull request 19). The links were plain `<a>` tags; they are now Next.js links like the menu
- New page `/stats`, "How CRUX is going": visits this week and over four weeks, visits per day, the busiest hours of the day (Sydney time), the busiest days of the week, the most used tools and the most played sessions. Linked from the About page ("See how CRUX is going") and the footer. The sidebar and phone menu are unchanged
- The numbers come from Vercel Web Analytics, read on the server through Vercel's query API (`src/lib/stats.ts`). Nothing new is collected: it reads the events CRUX has sent since 4 November. Results are cached for an hour, which is about 16 API calls an hour however many people open the page
- Charts are plain SVG in the clinic green (`src/components/stats/ColumnChart.tsx`). Each one can be read by hovering, by tapping, with the arrow keys after tabbing to it, or as a table. Screen readers always get the table
- Measured: text contrast 8.7 or better in all five themes and three brightness levels, nothing under 12px, no faded text, bar colour above 3:1 against the card in every theme, no sideways scroll at phone width, every button at least 44px

### In progress
- **Needs a token before it shows real numbers.** Josh: in Vercel, create an access token for the metabundle team, add it to the CRUX project as `VERCEL_ANALYTICS_TOKEN` (Production only), and redeploy. Until then the live page says "Not switched on yet". Preview links show clearly labelled sample numbers so the design can be reviewed
- Tested against a stand-in for Vercel's service with known answers, not against the real one, because there is no token on this machine. The request shapes follow Vercel's documentation

### What didn't work
- Nothing

### Next
- After the token is in, open `/stats` and check the numbers against the Vercel dashboard for the same days
- A "visit" is one person on one day: Vercel's anonymous visitor code resets daily. The page explains this
- Vercel's Pro plan allows two properties per custom event. The `tool_start` and `tool_5min` events use two (`tool`, `item`), which is what the page reads

## 16 November 2026 (later): "CRUX in numbers", redesigned for funding proposals

The first version went live this morning and is reading real numbers: Josh had already added the Vercel token. He then asked for listening hours on "Most played" and a stronger design, because the page will be used to win funding.

### Finished
- **Since launch**: a headline band with visits, sessions started and hours of listening since 4 November 2026, when counting began
- **Key findings**: plain sentences built from the numbers, with a "Copy these findings" button so they can go straight into a proposal
- The rest of the page is grouped as Reach, Engagement, When, What people use, Who and Learning
- **Engagement** adds sessions per visit and a chart of how long sessions last (from the length sent when a session ends)
- **What people use**: Tools and Most played can be ranked by sessions or by hours listened. Hours per session come from the 5-minute listening event, which already records the item, so no new tracking was needed
- **Who**: visits by device (phone, computer, tablet) and by country, each as a split bar with names and shares printed beside it. The three colours are from a validated colour-blind-safe set
- **Learning**: Your Brain checks started and completed, completion rate and average score
- **Save as PDF or print**: prints black on white with the menus and buttons removed. The print rules are at the end of `globals.css` and apply to any page
- Measured: text contrast 7.66 or better in all five themes and three brightness levels, nothing under 12px, no faded text, no sideways scroll on a phone, no overlapping chart labels, every button at least 44px

### In progress
- The new figures (device, country, session length, brain check, hours per item) were tested against a stand-in for Vercel's service with known answers. They have not yet been seen with the real numbers. Each one hides itself if its call fails, and the page then says some numbers couldn't be loaded

### What didn't work
- At phone width two labels touched on the session-length chart. The labels are now minutes only and the heading says "in minutes"

### Next
- Returning visitors and how many different people use CRUX over a month can't come from Vercel, because its visitor code resets daily. The app's own visit log (Supabase) records an anonymous id per device and would give both. It is built but not switched on
- About 30 Vercel API calls an hour. If Vercel ever rate-limits, raise `revalidate` in `src/app/stats/page.tsx`
