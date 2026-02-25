import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, unstable_noStore as noStore } from "next/cache";

function getClientIp(req: NextRequest): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() ?? null;

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return null;
}

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(req: NextRequest) {
  // Ensure this handler is never cached
  noStore();

  const { slug } = (await req.json()) as { slug?: string };

  if (!slug || typeof slug !== "string") {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const ip = getClientIp(req);
  if (!ip) {
    return NextResponse.json({ error: "Missing IP" }, { status: 400 });
  }

  const ipHash = await sha256(ip);

  const dedupeKey = ["dedupe", slug, ipHash].join(":");
  const counterKey = ["views", slug].join(":");

  const isNew = await redis.set(dedupeKey, "1", {
    nx: true,
    ex: 60 * 60 * 24,
  });

  if (!isNew) {
    return new NextResponse(null, { status: 202 });
  }

  const views = await redis.incr(counterKey);

  revalidateTag(`views:${slug}`, "default");

  return NextResponse.json({ views }, { status: 200 });
}
