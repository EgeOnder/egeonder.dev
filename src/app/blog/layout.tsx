import type { Metadata } from "next";

import { defaultMetadataRobots, defaultOpenGraphImage, defaultTwitterProfile, sharedKeywords, sharedMetadata } from "@/lib/metadata";

const BLOG_DESCRIPTION = "All writings and blog posts published on egeonder.dev.";
const BLOG_TITLE = `Blog — ${sharedMetadata.title}`;

export const metadata: Metadata = {
  title: "Blog",
  description: BLOG_DESCRIPTION,
  keywords: [...sharedKeywords, "blog", "articles", "writing"],
  robots: defaultMetadataRobots,
  category: "technology",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    type: "website",
    url: "/blog",
    title: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    siteName: sharedMetadata.title,
    locale: sharedMetadata.locale,
    images: [defaultOpenGraphImage],
  },
  twitter: {
    ...defaultTwitterProfile,
    card: "summary_large_image",
    title: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    images: ["/twitter-image"],
  },
  other: {
    pinterest: "nopin",
  },
};

export default function BlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
