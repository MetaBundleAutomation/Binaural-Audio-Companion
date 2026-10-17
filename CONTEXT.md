# CRUX — The Core of Calm | Project Context

## What This App Is

CRUX is a free Progressive Web App (PWA) combining three evidence-informed 
audio and breathing tools designed primarily for Australian military veterans 
with PTSD, anxiety and tinnitus — and anyone seeking calm, focus or better sleep.

Tagline: "The Core of Calm"
Live URL: https://cruxthecoreofcalm.app
Funded and built by: Metabundle (Joshua)
Les's role: Content fixes, UI adjustments, bug fixes

---

## The Three Tools

1. **Binaural Beats** — audio sessions tuned to brainwave frequencies:
   - Delta (deep sleep)
   - Theta (meditation/creativity)
   - Alpha (relaxed focus)
   - Beta (alertness)
   - Gamma (peak cognition)

2. **Noise Therapy** — white, pink and brown noise to mask environmental 
   triggers and reduce hypervigilance

3. **Box Breathing** — 4-4-4-4 breathing guide (inhale 4 / hold 4 / 
   exhale 4 / hold 4) used by military and first responders

---

## Current Status

- Live in production at cruxthecoreofcalm.app
- Hosted on Joshua's Vercel account (MetaBundleAutomation)
- Les makes fixes and improvements, Joshua deploys
- 3 npm vulnerabilities (2 high, 1 critical) — address carefully
- Has Chinese README (README-zh.md) — international reach

---

## Target Users

1. **Primary:** Australian military veterans with PTSD, anxiety, tinnitus
2. **Secondary:** Anyone seeking calm, focus or better sleep
3. **Also used by:** First responders

---

## Tech Stack

- **Framework:** Next.js 15 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4
- **Audio:** Web Audio API (binaural beat generation + noise synthesis)
- **Animation:** Canvas 2D API (box breathing visual)
- **PWA:** Service Worker (offline support)
- **Analytics:** Google Analytics (optional, via env var)
- **Package manager:** pnpm (not npm — use pnpm commands)
- **Structure:** src/ folder

---

## ⚠️ Important — Use pnpm not npm

This project uses pnpm. Always use:
- `pnpm install` (not npm install)
- `pnpm run dev` (not npm run dev)
- `pnpm add <package>` (not npm install <package>)

---

## Folder Structure

src/
├── app/          — Pages and routes
├── components/   — UI components
├── config.ts     — App configuration
├── data/         — Audio/session data
├── hooks/        — Custom React hooks
└── lib/          — Core audio logic

---

## Environment Variables

Copy `.env.example` to `.env.local`:

- `NEXT_PUBLIC_SITE_NAME` — "CRUX"
- `NEXT_PUBLIC_TITLE` — full page title
- `NEXT_PUBLIC_DESCRIPTION` — meta description
- `NEXT_PUBLIC_URL` — "https://cruxthecoreofcalm.app"
- `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` — optional

---

## Repository

- GitHub: MetaBundleAutomation/Binaural-Audio-Companion
- Not under VRLes — under Joshua's org (MetaBundleAutomation)
- Les has collaborator access

---

## Language & Terminology

- App name: **CRUX** or **CRUX — The Core of Calm**
- Repo name: **Binaural-Audio-Companion** (GitHub name, different from app name)
- The three features: **Binaural Beats**, **Noise Therapy**, **Box Breathing**
- Brainwave states: Delta / Theta / Alpha / Beta / Gamma
- Always refer to users as **veterans** not "patients"

---

## Key Contacts

- **Joshua** — joshua@metabundle.ai | Metabundle | owns the repo and Vercel deployment
- **Les** — makes fixes and content improvements

---

## Known Gaps / To Watch

- [ ] 3 npm vulnerabilities — fix carefully, test audio after any updates
- [ ] Always test Web Audio API after dependency updates
- [ ] Confirm .env.local exists on this laptop before running