import "@/app/globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
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

// display: "optional" — if Inter is not ready in the first-paint window the
// metric-matched system fallback is used for the session, so text never
// restyles late on a slow connection.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "optional",
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
    "theme-color": "#05070F",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
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
