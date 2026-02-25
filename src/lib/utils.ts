import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUtcOffset(offsetSeconds: number): string {
  const sign = offsetSeconds >= 0 ? "+" : "-";
  const absoluteSeconds = Math.abs(offsetSeconds);
  const hours = Math.floor(absoluteSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((absoluteSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");

  return `UTC${sign}${hours}:${minutes}`;
}

export function formatDate(date: string) {
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
}

export function isOlderThanOneYear(date: string) {
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return false;
  }

  const oneYearAfterPublish = new Date(parsedDate);
  oneYearAfterPublish.setFullYear(oneYearAfterPublish.getFullYear() + 1);

  return new Date() > oneYearAfterPublish;
}

export function getInitials(name: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "AU";
}

export function formatViewCount(count: number) {
  const normalizedCount = Number.isFinite(count) ? Math.trunc(count) : 0;

  return new Intl.NumberFormat("de-DE").format(normalizedCount);
}
