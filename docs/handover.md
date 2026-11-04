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
