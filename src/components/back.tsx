"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import type { HTMLAttributes } from "react";
import { cn } from "~/lib/utils";

interface BackProps extends HTMLAttributes<HTMLAnchorElement> {
  href?: string;
  from?: boolean;
}

export default function Back({ href, from = false, className }: BackProps) {
  const pathname = usePathname();
  const queryParams = useSearchParams();

  const fromParam = queryParams.get("from") || href || "/";

  return (
    <Link
      href={`${fromParam}${from ? `?from=${pathname}` : ""}`}
      className={cn("text-sm text-muted-foreground hover:underline", className)}
    >
      {"<-"} Back
    </Link>
  );
}
