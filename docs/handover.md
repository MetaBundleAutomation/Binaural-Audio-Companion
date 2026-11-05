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
