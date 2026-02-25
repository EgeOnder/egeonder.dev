import type { Metadata } from "next";
import { Suspense } from "react";

import { WritingsSection } from "@/app/_components/writings-section";
import { BlogSearchInput } from "@/app/blog/_components/blog-search-input";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { getAllBlogPostSummaries, type BlogPostSummary } from "@/lib/blog";

const POSTS_PER_PAGE = 9;
const QUERY_PARAM = "q";
const PAGE_PARAM = "page";

type BlogPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    page?: string | string[];
  }>;
};

export const metadata: Metadata = {
  title: "Blog — egeonder.dev",
  description: "All writings and blog posts published on egeonder.dev.",
};

export default function BlogPage({ searchParams }: BlogPageProps) {
  return (
    <Suspense fallback={<BlogPageFallback />}>
      <BlogPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function BlogPageContent({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const query = normalizeSearchQuery(params.q);
  const requestedPage = parsePositiveInt(params.page) ?? 1;
  const allPosts = await getAllBlogPostSummaries();
  const filteredPosts = filterPosts(allPosts, query);
  const totalResults = filteredPosts.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / POSTS_PER_PAGE));
  const currentPage = Math.min(requestedPage, totalPages);
  const sliceStart = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(sliceStart, sliceStart + POSTS_PER_PAGE);

  const emptyStateMessage = query ? `No writings found for "${query}".` : "No writings found.";

  return (
    <div className="space-y-8 pt-4 pb-12">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold">Blog</h1>
        <p className="text-lg text-muted-foreground">
          {query ? `Found ${totalResults} result${totalResults === 1 ? "" : "s"} for "${query}".` : `Browse all ${totalResults} post${totalResults === 1 ? "" : "s"}.`}
        </p>
      </div>

      <BlogSearchInput initialQuery={query} />

      <WritingsSection title="All writings" showViewAll={false} posts={paginatedPosts} emptyState={emptyStateMessage} />

      {totalPages > 1 ? (
        <div className="space-y-3">
          <Pagination className="rounded-2xl border bg-card/30 py-3">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={buildBlogHref(query, currentPage - 1)}
                  aria-disabled={currentPage === 1}
                  tabIndex={currentPage === 1 ? -1 : undefined}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
                />
              </PaginationItem>
              {getPaginationTokens(currentPage, totalPages).map((token, index) => (
                <PaginationItem key={`${token}-${index}`}>
                  {typeof token === "number" ? (
                    <PaginationLink href={buildBlogHref(query, token)} isActive={token === currentPage}>
                      {token}
                    </PaginationLink>
                  ) : (
                    <PaginationEllipsis />
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href={buildBlogHref(query, currentPage + 1)}
                  aria-disabled={currentPage === totalPages}
                  tabIndex={currentPage === totalPages ? -1 : undefined}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <p className="text-center text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function BlogPageFallback() {
  return (
    <div className="space-y-8 pt-4 pb-12">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold">Blog</h1>
        <p className="text-lg text-muted-foreground">Loading writings...</p>
      </div>
      <div className="h-10 animate-pulse rounded-xl bg-muted" />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-48 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}

function filterPosts(posts: BlogPostSummary[], query: string) {
  if (!query) {
    return posts;
  }

  const normalizedQuery = query.toLowerCase();

  return posts.filter((post) => {
    const searchableContent = [post.slug, post.metadata.title, post.metadata.description, ...(post.metadata.tags ?? [])].join(" ").toLowerCase();

    return searchableContent.includes(normalizedQuery);
  });
}

function normalizeSearchQuery(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  return rawValue?.trim() ?? "";
}

function parsePositiveInt(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  if (!rawValue) {
    return null;
  }

  const parsed = Number.parseInt(rawValue, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}

function buildBlogHref(query: string, page: number) {
  const params = new URLSearchParams();

  if (query) {
    params.set(QUERY_PARAM, query);
  }

  if (page > 1) {
    params.set(PAGE_PARAM, String(page));
  }

  const queryString = params.toString();
  return queryString ? `/blog?${queryString}` : "/blog";
}

function getPaginationTokens(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const tokens: Array<number | "ellipsis"> = [1];
  const startPage = Math.max(2, currentPage - 1);
  const endPage = Math.min(totalPages - 1, currentPage + 1);

  if (startPage > 2) {
    tokens.push("ellipsis");
  }

  for (let page = startPage; page <= endPage; page += 1) {
    tokens.push(page);
  }

  if (endPage < totalPages - 1) {
    tokens.push("ellipsis");
  }

  tokens.push(totalPages);
  return tokens;
}
