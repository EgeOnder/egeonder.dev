import type { MetadataRoute } from "next";
import { cacheLife } from "next/cache";

import { getAllBlogPostSummaries } from "@/lib/blog";
import { toAbsoluteSiteUrl } from "@/lib/metadata";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  "use cache";
  cacheLife("hours");

  const blogPosts = await getAllBlogPostSummaries();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: toAbsoluteSiteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: toAbsoluteSiteUrl("/blog"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: toAbsoluteSiteUrl(`/blog/${post.slug}`),
    lastModified: new Date(post.metadata.date),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...blogRoutes];
}
