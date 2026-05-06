import "@/app/globals.css";

import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import PreferencesProvider from "@/components/PreferencesProvider";
import BrightnessSync from "@/components/BrightnessSync";
import Toast from "@/components/Toast";
import { baseURL, description, siteName, title } from "@/config";

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
    "theme-color": "#0F1B2D",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ServiceWorkerRegistration />
        <PreferencesProvider>
          <BrightnessSync />
          <Toast />
          <Header />
          {children}
          <Footer />
          {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} />
          )}
        </PreferencesProvider>
      </body>
    </html>
  );
}
