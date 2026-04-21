export const siteName =
  process.env.NEXT_PUBLIC_SITE_NAME || "CRUX";

export const title =
  process.env.NEXT_PUBLIC_TITLE ||
  "CRUX — The Core of Calm | Binaural Beats for Veterans & Wellbeing";

export const description =
  process.env.NEXT_PUBLIC_DESCRIPTION ||
  "Binaural beats, noise therapy and box breathing — designed for Australian military veterans with PTSD, anxiety and tinnitus, and anyone seeking calm, focus or better sleep.";

const defaultBaseURL = "https://crux.metabundle.ai";

const VERCEL_URL =
  process.env.NEXT_PUBLIC_VERCEL_URL &&
  `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;

export const baseURL =
  process.env.NEXT_PUBLIC_URL ||
  VERCEL_URL ||
  (globalThis.location && globalThis.location.origin) ||
  defaultBaseURL;
