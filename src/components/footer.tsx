"use client";

import { SocialsSection } from "@/app/_components/socials-section";
import { ThemeSelector } from "@/app/_components/theme-selector";
import { Button } from "@/components/ui/button";
import { CalendarDotsIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="flex items-center gap-4 flex-col md:flex-row mt-8">
      <ThemeSelector />
      <SocialsSection />
      <Link href="/meet" className="md:ml-auto" target="_blank" rel="noopener noreferrer" aria-label="Book a call with me">
        <Button variant="outline">
          <CalendarDotsIcon className="size-4" />
          Book a call with me
        </Button>
      </Link>
    </footer>
  );
}
