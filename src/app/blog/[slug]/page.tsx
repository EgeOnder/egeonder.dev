import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";

import { BlogNavbarTitleSync } from "@/app/blog/[slug]/_components/blog-navbar-title-sync";
import { getBlogPostModule, getBlogSlugs, getBlogThumbnailAlt, getBlogThumbnailSrc } from "@/lib/blog";
import { getBlogAudioSrc } from "@/lib/blog";
import { getBlogViewTransitionNames } from "@/lib/blog-view-transition";
import { defaultMetadataRobots, defaultTwitterProfile, sharedKeywords, sharedMetadata } from "@/lib/metadata";
import { cacheLife } from "next/cache";

import { ReportView } from "./_components/report-view";
import { getViews } from "@/lib/views";
import { formatDate, formatViewCount, isOlderThanOneYear } from "@/lib/utils";
import { Footer } from "@/components/footer";
import { ActionButtons } from "./_components/action-buttons";
import { BlogVoiceTranscriptPlayer } from "./_components/blog-voice-transcript-player";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  "use cache";
  cacheLife("hours");

  const { slug } = await params;
  const blogPost = await getBlogPostModule(slug);

  if (!blogPost) {
    return {};
  }

  const canonicalPath = `/blog/${slug}`;
  const socialImage = getBlogThumbnailSrc(slug);
  const socialImageAlt = getBlogThumbnailAlt(blogPost.metadata.title);
  const authorName = blogPost.metadata.author?.trim();
  const openGraphImage = {
    url: socialImage,
    alt: socialImageAlt,
  };

  return {
    title: blogPost.metadata.title,
    description: blogPost.metadata.description,
    keywords: [...sharedKeywords, ...(blogPost.metadata.tags ?? [])],
    robots: defaultMetadataRobots,
    category: "technology",
    authors: [{ name: authorName || sharedMetadata.authorName }],
    creator: sharedMetadata.authorName,
    publisher: sharedMetadata.authorName,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: "article",
      url: canonicalPath,
      title: blogPost.metadata.title,
      description: blogPost.metadata.description,
      siteName: sharedMetadata.title,
      locale: sharedMetadata.locale,
      publishedTime: blogPost.metadata.date,
      authors: authorName ? [authorName] : [sharedMetadata.authorName],
      tags: blogPost.metadata.tags,
      images: [openGraphImage],
    },
    twitter: {
      ...defaultTwitterProfile,
      card: "summary_large_image",
      title: blogPost.metadata.title,
      description: blogPost.metadata.description,
      images: [socialImage],
    },
    other: {
      pinterest: "nopin",
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  "use cache";
  cacheLife("hours");

  const { slug } = await params;
  const views = await getViews(slug);
  const blogPost = await getBlogPostModule(slug);

  if (!blogPost) notFound();

  const Post = blogPost.default;
  const viewTransitionNames = getBlogViewTransitionNames(slug);
  const publishedDate = formatDate(blogPost.metadata.date);
  const isOlderPost = isOlderThanOneYear(blogPost.metadata.date);
  const imageSrc = getBlogThumbnailSrc(slug);
  const imageAlt = getBlogThumbnailAlt(blogPost.metadata.title);
  const audioSrc = await getBlogAudioSrc(slug, blogPost.metadata.audioSrc);

  return (
    <article className="mx-auto max-w-3xl pb-16 space-y-8">
      <ReportView slug={slug} />
      <BlogNavbarTitleSync title={blogPost.metadata.title} />
      <header className="space-y-5 pb-2">
        <ViewTransition name={viewTransitionNames.image}>
          <div className="overflow-hidden rounded-2xl border bg-muted">
            <Image src={imageSrc} alt={imageAlt} width={1200} height={675} priority className="h-auto w-full object-cover dark:brightness-75" />
          </div>
        </ViewTransition>
        <ViewTransition name={viewTransitionNames.meta}>
          <p className="text-sm text-muted-foreground">
            {publishedDate}
            {blogPost.metadata.readingTime ? ` • ${blogPost.metadata.readingTime}` : ""} {views >= 1000 ? ` • ${formatViewCount(views)} view${views === 1 ? "" : "s"}` : ""}
          </p>
        </ViewTransition>
        {isOlderPost ? (
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-yellow-900 dark:text-yellow-200">
            Warning: This post is more than 1 year old and may contain outdated information.
          </div>
        ) : null}
        <ViewTransition name={viewTransitionNames.title}>
          <h1 className="text-4xl font-semibold tracking-tight">{blogPost.metadata.title}</h1>
        </ViewTransition>
        <ViewTransition name={viewTransitionNames.description}>
          <p id="blog-post-title" className="text-lg text-muted-foreground">
            {blogPost.metadata.description}
          </p>
        </ViewTransition>
        <ActionButtons summary={blogPost.metadata.summary} summaryProvider={blogPost.metadata.summaryProvider} title={blogPost.metadata.title} />
        <BlogVoiceTranscriptPlayer src={audioSrc} title={blogPost.metadata.title} />
      </header>
      <Post />
      <Footer />
    </article>
  );
}
