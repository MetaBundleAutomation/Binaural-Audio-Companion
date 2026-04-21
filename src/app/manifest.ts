import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CRUX — The Core of Calm",
    short_name: "CRUX",
    description:
      "Binaural beats, noise therapy and box breathing for calm, focus and sleep — designed for veterans and wellbeing.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#151A1E",
    theme_color: "#2B6B7F",
    categories: ["health", "wellness", "lifestyle"],
    icons: [
      {
        src: "/api/pwa-icon?size=192",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/api/pwa-icon?size=512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
