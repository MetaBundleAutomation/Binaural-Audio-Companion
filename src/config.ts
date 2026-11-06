// The app was called CRUX until November 2026. "crux" survives as the internal
// codename: storage keys, the service worker cache and file names still use
// it, because renaming those would wipe people's saved settings.

export const siteName =
  process.env.NEXT_PUBLIC_SITE_NAME || "Community Treatment and Educational Platform";

/** Short form for tight spots, such as the label under the icon on a phone's home screen. */
export const shortName = "CTEP";

export const title =
  process.env.NEXT_PUBLIC_TITLE ||
  "Community Treatment and Educational Platform | Calm tools and health education for veterans";

export const description =
  process.env.NEXT_PUBLIC_DESCRIPTION ||
  "Free calm tools and plain-language health education for Australian veterans, first responders and their families: binaural beats, noise therapy, guided breathing, a body scan, and guides to getting help.";

const defaultBaseURL = "https://cruxthecoreofcalm.app";

const VERCEL_URL =
  process.env.NEXT_PUBLIC_VERCEL_URL &&
  `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;

export const baseURL =
  process.env.NEXT_PUBLIC_URL ||
  VERCEL_URL ||
  (globalThis.location && globalThis.location.origin) ||
  defaultBaseURL;
