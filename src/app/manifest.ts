import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CRUX — The Core of Calm",
    short_name: "CRUX",
    description:
      "Binaural beats, coloured noise and box breathing for calm and focus.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0F1B2D",
    theme_color: "#0F1B2D",
    categories: ["health", "wellness", "lifestyle"],
    icons: [
      {
        src: "/crux-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/crux-icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/crux-icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/crux-icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/crux-icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
