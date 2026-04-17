import "@/app/globals.css";

import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import PreferencesProvider from "@/components/PreferencesProvider";
import BrightnessSync from "@/components/BrightnessSync";
import { baseURL, description, siteName, title } from "@/config";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "binaural beats",
    "brain waves",
    "meditation",
    "focus",
    "relaxation",
    "sleep",
    "alpha waves",
    "theta waves",
    "delta waves",
    "beta waves",
    "audio therapy",
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
    icon: "/icon?<generated>",
    shortcut: "/icon?<generated>",
    // apple-icon.tsx is auto-detected by Next.js and generates the 180×180 touch icon
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
    "theme-color": "#2B6B7F",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ServiceWorkerRegistration />
        <PreferencesProvider>
          <BrightnessSync />
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
