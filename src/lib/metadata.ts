import type { Metadata } from "next";

import { OG_IMAGE_SIZE } from "@/lib/og-image";

const DEFAULT_SITE_URL = "https://egeonder.dev";

export const PROFILES = {
  github: {
    username: "egeonder",
  },
  linkedin: {
    username: "egeonder",
  },
  twitter: {
    username: "aegeonder",
  },
} as const;

export const sharedMetadata = {
  title: "egeonder.dev",
  description: "Personal website and blog of Ege Onder.",
  language: "en-US",
  locale: "en_US",
  authorName: "Ege Onder",
  siteUrl: DEFAULT_SITE_URL,
} as const;

export const sharedKeywords = ["Ege Onder", "Ege Önder", "egeonder", "egeonder dev", "egeonder.dev", "software engineer", "web development"] as const;

export const defaultMetadataRobots: NonNullable<Metadata["robots"]> = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-video-preview": -1,
    "max-image-preview": "large",
    "max-snippet": -1,
  },
};

export const defaultOpenGraphImage = {
  url: "/opengraph-image",
  width: OG_IMAGE_SIZE.width,
  height: OG_IMAGE_SIZE.height,
  alt: sharedMetadata.title,
} as const;

export const defaultTwitterProfile = {
  site: `@${PROFILES.twitter.username}`,
  creator: `@${PROFILES.twitter.username}`,
} as const;

function getConfiguredSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? DEFAULT_SITE_URL;
}

function toValidSiteUrl(value: string) {
  try {
    return new URL(value);
  } catch {
    return new URL(DEFAULT_SITE_URL);
  }
}

const metadataBase = toValidSiteUrl(getConfiguredSiteUrl());

export function getMetadataBase() {
  return metadataBase;
}

export function getSiteUrl() {
  return metadataBase.origin;
}

export function toAbsoluteSiteUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, metadataBase).toString();
}

export function normalizeMetadataImageUrl(imagePath: string) {
  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  return imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
}
