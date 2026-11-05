import "@/app/globals.css";

import type { Metadata } from "next";
import { Barlow_Condensed, DM_Sans } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import SessionTracker from "@/components/SessionTracker";
import Footer from "@/components/Footer";
import AppShell from "@/components/AppShell";
import BackgroundFX from "@/components/BackgroundFX";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import PreferencesProvider from "@/components/PreferencesProvider";
import AppearanceSync from "@/components/AppearanceSync";
import IOSTouchFix from "@/components/IOSTouchFix";
import Toast from "@/components/Toast";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import { baseURL, description, siteName, title } from "@/config";

// Body text: DM Sans, the text face on the clinic's own site.
// display: "optional" — if it is not ready in the first-paint window the
// metric-matched system fallback is used for that page view, so body text
// never restyles late on a slow connection.
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "optional",
});

// Headings: Barlow Condensed, a free stand-in for the licensed condensed
// grotesque the clinic sets its uppercase headings in. "swap" so headings
// always end up in the display face; next/font's size-adjusted fallback keeps
// the shift small.
const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "binaural beats",
    "PTSD relief",
    "veterans mental health",
    "anxiety relief",
    "tinnitus relief",
    "box breathing",
    "noise therapy",
    "meditation",
    "focus",
    "relaxation",
    "sleep",
    "alpha waves",
    "theta waves",
    "delta waves",
    "audio therapy",
    "Australian veterans",
    "military mental health",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: [
      { url: "/crux-icon.svg", type: "image/svg+xml" },
      { url: "/favicon.png",   type: "image/png", sizes: "32x32" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
  alternates: {
    canonical: baseURL,
  },
  metadataBase: new URL(baseURL),
  openGraph: {
    title,
    description,
    siteName,
    url: baseURL,
    images: [
      {
        url: "/api/og",
        alt: `${siteName} Open Graph Image`,
      },
    ],
  },
  other: {
    "color-scheme": "dark",
    "theme-color": "#161F24",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${dmSans.variable} ${barlowCondensed.variable}`}>
      <body>
        <BackgroundFX />
        <ServiceWorkerRegistration />
        <PreferencesProvider>
          <AppearanceSync />
          <IOSTouchFix />
          <Toast />
          <DisclaimerBanner />
          <AppShell>
            {children}
            <Footer />
          </AppShell>
          {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} />
          )}
        </PreferencesProvider>
        {/* Vercel Web Analytics — privacy-friendly page-view counts, no cookies */}
        <Analytics />
        <SessionTracker />
      </body>
    </html>
  );
}
