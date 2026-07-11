"use client";

import Image from "next/image";
import type { ComponentProps, ReactNode } from "react";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import TextHighlighter from "@/components/ui/text-highlighter";
import Link from "next/link";

type WebsitePreviewLinkProps = {
  children: ReactNode;
  href: string;
  name: string;
  previewAlt: string;
  previewSrc: string;
  highlightProps?: Omit<ComponentProps<typeof TextHighlighter>, "children">;
};

export function WebsitePreviewLink({ children, href, name, previewAlt, previewSrc, highlightProps }: WebsitePreviewLinkProps) {
  return (
    <HoverCard>
      <HoverCardTrigger
        delay={180}
        closeDelay={100}
        render={
          <Link
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit ${name} website`}
            className="inline rounded-[0.3em] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          />
        }
      >
        <TextHighlighter {...highlightProps}>{children}</TextHighlighter>
      </HoverCardTrigger>
      <HoverCardContent
        side="top"
        sideOffset={10}
        className="w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border/70 bg-background/95 p-0 shadow-2xl shadow-black/15 backdrop-blur-xl duration-150"
        aria-label={`${name} website preview`}
      >
        <Link href={href} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${name} website`}>
          <div className="relative aspect-64/27 overflow-hidden bg-muted">
            <Image src={previewSrc} alt={previewAlt} fill sizes="(max-width: 400px) calc(100vw - 2rem), 22rem" className="object-cover object-top" />
            <div aria-hidden className="absolute inset-0 ring-1 ring-inset ring-black/5" />
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-border/70 px-3.5 py-3">
            <div className="min-w-0">
              <p className="truncate font-medium leading-none text-foreground">{name}</p>
              <p className="mt-1 truncate text-xs text-muted-foreground">{new URL(href).hostname.replace(/^www\./, "")}</p>
            </div>
          </div>
        </Link>
      </HoverCardContent>
    </HoverCard>
  );
}
