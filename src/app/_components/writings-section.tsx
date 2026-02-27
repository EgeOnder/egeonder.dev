import UnderlineCenter from "@/components/ui/underline-center";
import { type BlogPostSummary, getAllBlogPostSummaries } from "@/lib/blog";
import { motion } from "motion/react";
import { WritingCard } from "./writing-card";
import { cacheLife } from "next/cache";
import { Suspense } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

type WritingsSectionProps = {
  title?: string;
  limit?: number;
  showViewAll?: boolean;
  posts?: BlogPostSummary[];
  emptyState?: string;
};

export async function WritingsSection({ title = "Latest writings", limit, showViewAll = true, posts, emptyState }: WritingsSectionProps = {}) {
  "use cache";
  cacheLife("hours");

  const allPosts = posts ?? (await getAllBlogPostSummaries());
  const visiblePosts = typeof limit === "number" ? allPosts.slice(0, Math.max(0, limit)) : allPosts;
  const shouldShowViewAll = showViewAll && visiblePosts.length < allPosts.length;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{title}</h2>
        {shouldShowViewAll && (
          <motion.div whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 320, damping: 24 }}>
            <Link href="/blog" prefetch>
              <UnderlineCenter>View all</UnderlineCenter>
            </Link>
          </motion.div>
        )}
      </div>
      {visiblePosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visiblePosts.map((post) => (
            <Suspense key={post.slug} fallback={<div className="h-48 bg-muted rounded-xl animate-pulse w-full" />}>
              <WritingCard slug={post.slug} title={post.metadata.title} description={post.metadata.description} date={formatDate(post.metadata.date)} readingTime={post.metadata.readingTime} />
            </Suspense>
          ))}
        </div>
      ) : (
        <div className="px-5 py-8 text-center text-muted-foreground">{emptyState ?? "No writings found."}</div>
      )}
    </div>
  );
}
