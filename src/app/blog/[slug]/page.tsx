import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";

import { BlogNavbarTitleSync } from "@/app/blog/[slug]/_components/blog-navbar-title-sync";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getBlogPostModule, getBlogSlugs } from "@/lib/blog";
import { getBlogViewTransitionNames } from "@/lib/blog-view-transition";
import { cacheLife } from "next/cache";

import { ReportView } from "./_components/report-view";
import { getViews } from "@/lib/views";
import { formatDate, formatViewCount, getInitials, isOlderThanOneYear } from "@/lib/utils";

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

  return {
    title: blogPost.metadata.title,
    description: blogPost.metadata.description,
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
  const authorName = blogPost.metadata.author?.trim();
  const imageAlt = blogPost.metadata.imageAlt ?? blogPost.metadata.title;

  return (
    <article className="mx-auto max-w-3xl pb-16 space-y-8">
      <ReportView slug={slug} />
      <BlogNavbarTitleSync title={blogPost.metadata.title} />
      <header className="space-y-5 pb-2">
        {blogPost.metadata.image ? (
          <ViewTransition name={viewTransitionNames.image}>
            <div className="overflow-hidden rounded-2xl border bg-muted">
              <Image src={blogPost.metadata.image} alt={imageAlt} width={1200} height={675} priority className="h-auto w-full object-cover" />
            </div>
          </ViewTransition>
        ) : null}
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
        {authorName ? (
          <ViewTransition name={viewTransitionNames.author}>
            <div className="flex items-center gap-3 pt-1">
              <Avatar size="lg" className="size-11 after:mix-blend-normal dark:after:mix-blend-normal">
                {blogPost.metadata.authorAvatar ? <AvatarImage src={blogPost.metadata.authorAvatar} alt={authorName} /> : null}
                <AvatarFallback>{getInitials(authorName)}</AvatarFallback>
              </Avatar>
              <div className="leading-tight">
                <p className="font-medium">{authorName}</p>
                {blogPost.metadata.authorRole ? <p className="text-sm text-muted-foreground">{blogPost.metadata.authorRole}</p> : null}
              </div>
            </div>
          </ViewTransition>
        ) : null}
      </header>
      <Post />
    </article>
  );
}
