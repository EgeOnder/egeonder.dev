import type { MetadataRoute } from "next";

import { getSiteUrl, toAbsoluteSiteUrl } from "@/lib/metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/private/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/_next/", "/private/"],
      },
    ],
    sitemap: toAbsoluteSiteUrl("/sitemap.xml"),
    host: getSiteUrl(),
  };
}
