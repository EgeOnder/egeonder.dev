import "server-only";
import { redis } from "@/lib/redis";
import { cacheLife, cacheTag } from "next/cache";

export async function getViews(slug: string): Promise<number> {
  "use cache";

  cacheTag(`views:${slug}`);
  cacheLife({ revalidate: 60 });

  const viewsKey = ["views", slug].join(":");
  return (await redis.get<number>(viewsKey)) ?? 0;
}
