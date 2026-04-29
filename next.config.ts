import type { NextConfig } from "next";

// ─── Content-Security-Policy ──────────────────────────────────────────────────
// Restricts what the browser is allowed to load or connect to.
//
// Notes:
//  • 'unsafe-inline' is required for style-src because React renders inline
//    style attributes and Next.js injects a small hydration style block.
//  • 'unsafe-inline' is required for script-src because Next.js injects the
//    __NEXT_DATA__ hydration script inline. A nonce-based approach is the
//    stricter alternative but requires middleware and is out of scope here.
//  • connect-src includes Google Analytics endpoints used by @next/third-parties.
//  • media-src 'self' covers the binaural audio tracks served from /public.
//  • worker-src 'self' covers the service worker (/sw.js).
// ─────────────────────────────────────────────────────────────────────────────
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self'",
  "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com",
  "media-src 'self'",
  "worker-src 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      // ── Security headers — applied to every route ────────────────────────
      {
        source: "/(.*)",
        headers: [
          {
            // Restrict resource origins and prevent data exfiltration
            key: "Content-Security-Policy",
            value: CSP,
          },
          {
            // Prevent this app from being embedded in an iframe (clickjacking)
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            // Stop browsers from MIME-sniffing response types
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            // Send only the origin (not the full URL) in Referer headers
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            // Force HTTPS for 1 year; prevents protocol-downgrade attacks.
            // includeSubDomains covers any subdomains (e.g. www.*).
            // preload opt-in — submit to hstspreload.org once domain is live.
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            // Restrict browser APIs this app has no need for.
            // Denying camera, microphone, geolocation, payment and USB
            // prevents any injected third-party code from accessing them.
            key: "Permissions-Policy",
            value: [
              "camera=()",
              "microphone=()",
              "geolocation=()",
              "payment=()",
              "usb=()",
              "interest-cohort=()",   // opt out of FLoC / Topics API
            ].join(", "),
          },
        ],
      },

      // ── Service worker — always fresh ────────────────────────────────────
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
          {
            // Allow the SW to control all routes under the root
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
