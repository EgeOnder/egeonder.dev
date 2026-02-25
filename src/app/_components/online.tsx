import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { redis } from "@/lib/redis";
import { formatUtcOffset } from "@/lib/utils";
import { cacheLife } from "next/cache";

const ONE_WEEK_IN_SECONDS = 60 * 60 * 24 * 7;
const ONLINE_START_HOUR = 9;
const ONLINE_END_HOUR = 21;

function isOnlineByOffset(offsetSeconds: number): boolean {
  const localTime = new Date(Date.now() + offsetSeconds * 1000);
  const localDay = localTime.getUTCDay();
  const localHour = localTime.getUTCHours();
  const isWeekday = localDay >= 1 && localDay <= 5;
  const isBusinessHours = localHour >= ONLINE_START_HOUR && localHour < ONLINE_END_HOUR;

  return isWeekday && isBusinessHours;
}

async function fetchTimeZoneOffsetFromApi(latitude: number, longitude: number): Promise<number | null> {
  const apiKey = process.env.TIMEZONE_DB_API_KEY;

  if (!apiKey) {
    return null;
  }

  const params = new URLSearchParams({
    key: apiKey,
    format: "json",
    by: "position",
    lat: latitude.toString(),
    lng: longitude.toString(),
  });

  const response = await fetch(`http://api.timezonedb.com/v2.1/get-time-zone?${params.toString()}`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { status?: string; gmtOffset?: number };

  if (data.status !== "OK" || typeof data.gmtOffset !== "number") {
    return null;
  }

  return data.gmtOffset;
}

async function getTimeZoneOffset(latitude: number, longitude: number): Promise<number | null> {
  const cacheKey = `timezone-offset:${latitude}:${longitude}`;

  try {
    const cachedOffset = await redis.get<number>(cacheKey);
    if (typeof cachedOffset === "number") {
      return cachedOffset;
    }

    const apiOffset = await fetchTimeZoneOffsetFromApi(latitude, longitude);
    if (apiOffset !== null) {
      await redis.set(cacheKey, apiOffset, { ex: ONE_WEEK_IN_SECONDS });
    }

    return apiOffset;
  } catch {
    // If Redis is unavailable, bypass cache and fetch directly.
    return fetchTimeZoneOffsetFromApi(latitude, longitude);
  }
}

export async function Online() {
  "use cache";
  cacheLife({
    stale: 3600,
    revalidate: 7200,
    expire: 86400,
  });

  const latitude = 45.0703;
  const longitude = 7.6869;
  const timeOffset = await getTimeZoneOffset(latitude, longitude);
  const utcOffsetText = timeOffset === null ? null : formatUtcOffset(timeOffset);
  const isOnline = timeOffset === null ? false : isOnlineByOffset(timeOffset);
  const statusDotClass = isOnline ? "bg-green-400" : "bg-zinc-500";
  const pingClass = isOnline ? "animate-ping" : "";

  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger delay={0}>
          <div className="relative mr-3">
            <div className={`absolute top-1/2 left-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full ${statusDotClass}`} />
            <div className={`absolute top-1/2 left-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full ${statusDotClass} ${pingClass}`} />
          </div>
        </TooltipTrigger>
        <TooltipContent side="left">{isOnline ? "Currently reachable" : "Offline"}</TooltipContent>
      </Tooltip>
      <span className="uppercase tracking-widest text-sm">
        Turin, IT
        {utcOffsetText ? ` — ${utcOffsetText}` : ""}
      </span>
    </div>
  );
}
