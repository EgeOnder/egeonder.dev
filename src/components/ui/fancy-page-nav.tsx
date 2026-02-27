"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const PAGE_LINKS = [
  { href: "/page-1", label: "01" },
  { href: "/page-2", label: "02" },
  { href: "/page-3", label: "03" },
  { href: "/page-4", label: "04" },
  { href: "/page-5", label: "05" },
];

type FancyPageNavProps = {
  className?: string;
};

export function FancyPageNav({ className }: FancyPageNavProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("fixed top-6 right-6 z-40 flex gap-2", className)}>
      {PAGE_LINKS.map((link) => {
        const active = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-full border px-3 py-1 text-xs tracking-[0.25em] backdrop-blur-md transition-colors",
              active ? "border-current bg-foreground text-background" : "border-current/40 bg-background/20 text-current hover:border-current hover:bg-background/40",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
