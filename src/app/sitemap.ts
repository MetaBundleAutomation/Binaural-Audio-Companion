import type { MetadataRoute } from "next";
import { baseURL } from "@/config";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: baseURL,
      lastModified: new Date(),
    },
    {
      url: `${baseURL}/binaural`,
      lastModified: new Date(),
    },
    {
      url: `${baseURL}/noise`,
      lastModified: new Date(),
    },
    {
      url: `${baseURL}/breathe`,
      lastModified: new Date(),
    },
    {
      url: `${baseURL}/body-scan`,
      lastModified: new Date(),
    },
    {
      url: `${baseURL}/brain`,
      lastModified: new Date(),
    },
    {
      url: `${baseURL}/room`,
      lastModified: new Date(),
    },
    {
      url: `${baseURL}/about`,
      lastModified: new Date(),
    },
    {
      url: `${baseURL}/instructions`,
      lastModified: new Date(),
    },
  ];
}
