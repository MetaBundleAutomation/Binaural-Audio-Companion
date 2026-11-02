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