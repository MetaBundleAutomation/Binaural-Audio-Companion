# CRUX — The Core of Calm

Binaural beats, noise therapy and box breathing — designed for Australian military veterans with PTSD, anxiety and tinnitus, and anyone seeking calm, focus or better sleep.

Funded and powered by [Metabundle](https://metabundle.ai).

---

## What is CRUX?

CRUX is a progressive web app (PWA) that combines three evidence-informed tools:

- **Binaural Beats** — audio sessions tuned to specific brainwave frequencies (Delta, Theta, Alpha, Beta, Gamma) to support focus, relaxation, meditation or sleep.
- **Noise Therapy** — white, pink and brown noise to mask environmental triggers and reduce hypervigilance.
- **Box Breathing** — a 4-4-4-4 breathing guide used by military and first responders to regulate the nervous system under stress.

---

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- Web Audio API (binaural beat generation, noise synthesis)
- Canvas 2D API (box breathing animation)
- Service Worker (PWA / offline support)

---

## Getting Started

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```dotenv
NEXT_PUBLIC_SITE_NAME="CRUX"
NEXT_PUBLIC_TITLE="CRUX — The Core of Calm | Binaural Beats for Veterans & Wellbeing"
NEXT_PUBLIC_DESCRIPTION="Binaural beats, noise therapy and box breathing for calm, focus and sleep."
NEXT_PUBLIC_URL="https://cruxthecoreofcalm.app"

# Optional — Google Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=""

# The room (live chat) and live numbers on the About page — see supabase/README.md
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""

# "Support CRUX" button on the About page
NEXT_PUBLIC_DONATE_URL=""
```

Vercel Web Analytics is always on (page views plus the usage events described in
`src/lib/analytics.ts`). The room and the live numbers switch on once the two
Supabase variables are set; the setup steps are in [supabase/README.md](supabase/README.md).

---

## Contact

**Joshua** — [Joshua@metabundle.ai](mailto:Joshua@metabundle.ai)  
0402 503 653  
[metabundle.ai](https://metabundle.ai)

---

## License

MIT © 2026 Metabundle
