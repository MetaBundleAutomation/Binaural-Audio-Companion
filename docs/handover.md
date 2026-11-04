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
