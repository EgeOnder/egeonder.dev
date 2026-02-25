"use client";

import { Input } from "@/components/ui/input";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

const QUERY_PARAM = "q";
const PAGE_PARAM = "page";
const SEARCH_DEBOUNCE_MS = 250;

type BlogSearchInputProps = {
  initialQuery: string;
};

export function BlogSearchInput({ initialQuery }: BlogSearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const nextQuery = query.trim();

      if (nextQuery) {
        params.set(QUERY_PARAM, nextQuery);
      } else {
        params.delete(QUERY_PARAM);
      }

      params.delete(PAGE_PARAM);

      const nextQueryString = params.toString();
      const nextHref = nextQueryString ? `${pathname}?${nextQueryString}` : pathname;
      const currentQueryString = searchParams.toString();
      const currentHref = currentQueryString ? `${pathname}?${currentQueryString}` : pathname;

      if (nextHref === currentHref) {
        return;
      }

      startTransition(() => {
        router.replace(nextHref, { scroll: false });
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [pathname, query, router, searchParams, startTransition]);

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <Input
        id="blog-search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
        }}
        type="search"
        placeholder="Search by title, description, slug, or tag"
        aria-label="Search blog posts"
        autoComplete="off"
        className="h-10"
      />
      <div className="flex items-center gap-2">
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
            }}
            className="inline-flex h-10 items-center justify-center px-4 text-sm text-foreground transition-colors hover:text-muted-foreground"
          >
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}
