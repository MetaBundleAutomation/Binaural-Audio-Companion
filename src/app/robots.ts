import type { MetadataRoute } from "next";
import { baseURL } from "@/config";

export default function robots(): MetadataRoute.Robots {
  // Mock-up deploys set NEXT_PUBLIC_ALLOW_INDEXING=false to stay out of search
  // engines. Unset (the live site) keeps the normal allow list.
  if (process.env.NEXT_PUBLIC_ALLOW_INDEXING === "false") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/about", "/api/og", "/icon", "/sitemap.xml"],
      disallow: ["/private/"],
    },
    sitemap: `${baseURL}/sitemap.xml`,
  };
}
