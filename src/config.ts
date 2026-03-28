export const siteName =
  process.env.NEXT_PUBLIC_SITE_NAME || "MindFlow";

export const title =
  process.env.NEXT_PUBLIC_TITLE ||
  "MindFlow - Binaural Beats for Focus, Relaxation & Sleep";

export const description =
  process.env.NEXT_PUBLIC_DESCRIPTION ||
  "Synchronize your brain's neural activity for mental clarity, focus, relaxation or sleep. Enhance your mind with scientifically-designed binaural beats audio therapy.";

const defaultBaseURL = "https://mindflow.app";

const VERCEL_URL =
  process.env.NEXT_PUBLIC_VERCEL_URL &&
  `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;

export const baseURL =
  process.env.NEXT_PUBLIC_URL ||
  VERCEL_URL ||
  (globalThis.location && globalThis.location.origin) ||
  defaultBaseURL;
