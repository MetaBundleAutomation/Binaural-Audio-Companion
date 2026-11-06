import type { MetadataRoute } from "next";
import { shortName, siteName } from "@/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteName,
    short_name: shortName,
    description:
      "Calm tools and health education for veterans, first responders and their families.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#161F24",
    theme_color: "#161F24",
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
