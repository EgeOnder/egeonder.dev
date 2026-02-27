"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { RadarIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RefreshCWIcon } from "./ui/refresh-cw";
import { ArrowLeftIcon } from "./ui/arrow-left";

type NotFoundCopy = {
  code: string;
  heading: string;
  detail: string;
  coordinate: string;
};

const codeFragments = ["ROUTE_NOT_FOUND", "LINK_DESYNC", "PAGE_DRIFT", "DEAD_ENDPOINT", "MISSING_NODE", "VOID_REDIRECT"] as const;

const leadFragments = ["This path", "This address", "This page", "That link", "Your destination", "This waypoint"] as const;

const actionFragments = ["slipped through the cracks", "ghosted the map", "fell into static", "took an unlisted detour", "missed the latest deploy", "escaped the route graph"] as const;

const detailFragments = [
  "No worries, the system is stable and we can route you back in seconds.",
  "Everything else is still online; only this address is currently unreachable.",
  "Looks like this URL is from an older timeline. A fresh path is ready.",
  "The content may have moved, been renamed, or never existed in this branch.",
  "Navigation ping returned empty. Try a new coordinate or head back home.",
] as const;

const sectorNames = ["NOVA", "ORBIT", "RIFT", "PARALLAX", "ECHO", "LUMEN", "FRACTAL"] as const;

const normalizeSeed = (seed: number) => {
  const normalized = Math.abs(Math.floor(seed)) >>> 0;
  return normalized === 0 ? 1 : normalized;
};

const nextSeed = (seed: number) => (Math.imul(seed, 1664525) + 1013904223) >>> 0;

const createCopyFromSeed = (seedInput: number): NotFoundCopy => {
  let seed = normalizeSeed(seedInput);

  const pickIndex = (length: number) => {
    seed = nextSeed(seed);
    return seed % length;
  };

  const pick = <T,>(items: readonly T[]) => items[pickIndex(items.length)];
  const sector = `${pick(sectorNames)}-${String(pickIndex(90) + 10)}`;

  return {
    code: `404 // ${pick(codeFragments)}`,
    heading: `${pick(leadFragments)} ${pick(actionFragments)}.`,
    detail: pick(detailFragments),
    coordinate: `SECTOR ${sector} / NULL-ZONE`,
  };
};

type CreativeNotFoundProps = {
  imageAlt?: string;
  imageSrc: string;
  className?: string;
};

const getClientSeed = () => {
  if (typeof window === "undefined") {
    return 404;
  }

  return window.crypto.getRandomValues(new Uint32Array(1))[0] ?? 404;
};

export function CreativeNotFound({ imageAlt = "404 visual", imageSrc, className }: CreativeNotFoundProps) {
  const [copy, setCopy] = useState<NotFoundCopy>(() => createCopyFromSeed(404));
  const homeIconRef = useRef<{ startAnimation: () => void; stopAnimation: () => void } | null>(null);
  const shuffleIconRef = useRef<{ startAnimation: () => void; stopAnimation: () => void } | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setCopy(createCopyFromSeed(getClientSeed()));
    }, 0);

    return () => {
      window.clearTimeout(timeout);
    };
  }, []);

  const shuffleCopy = useCallback(() => {
    setCopy(createCopyFromSeed(getClientSeed()));
  }, []);

  const handleHomeHoverStart = useCallback(() => {
    homeIconRef.current?.startAnimation();
  }, []);

  const handleHomeHoverEnd = useCallback(() => {
    homeIconRef.current?.stopAnimation();
  }, []);

  const handleShuffleHoverStart = useCallback(() => {
    shuffleIconRef.current?.startAnimation();
  }, []);

  const handleShuffleHoverEnd = useCallback(() => {
    shuffleIconRef.current?.stopAnimation();
  }, []);

  return (
    <section className={cn("relative isolate min-h-[calc(100dvh-5rem)]", className)}>
      <div className="relative overflow-hidden">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden"
          >
            <Image src={imageSrc} alt={imageAlt} className="object-cover" height={600} width={600} />
          </motion.div>

          <div className="flex flex-col justify-center gap-6 py-2">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.35 }}
              className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase"
            >
              {copy.coordinate}
            </motion.p>

            <div className="w-[80vw] lg:w-[35vw] flex justify-center flex-col">
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.35 }}
                className="mb-2 inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-3 py-1.5 font-mono text-xs w-fit"
              >
                <RadarIcon className="size-3.5 text-orange-600 dark:text-orange-300" />
                {copy.code}
              </motion.p>

              <motion.h1
                key={copy.heading}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="font-serif text-4xl leading-[0.95] sm:text-5xl md:text-6xl"
              >
                <span className="mt-2 block text-balance text-2xl leading-tight sm:text-3xl md:text-4xl">{copy.heading}</span>
              </motion.h1>

              <motion.p
                key={copy.detail}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="mt-4 max-w-xl text-balance text-sm text-muted-foreground sm:text-base"
              >
                {copy.detail}
              </motion.p>
            </div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.35 }} className="flex flex-wrap items-center gap-3">
              <Link href="/" className={cn(buttonVariants({ size: "lg" }), "rounded-full")} onMouseEnter={handleHomeHoverStart} onMouseLeave={handleHomeHoverEnd}>
                <ArrowLeftIcon ref={homeIconRef} data-icon="inline-start" />
                Back home
              </Link>
              <Button variant="outline" size="lg" className="rounded-full" onClick={shuffleCopy} onMouseEnter={handleShuffleHoverStart} onMouseLeave={handleShuffleHoverEnd}>
                <RefreshCWIcon ref={shuffleIconRef} data-icon="inline-start" />
                Shuffle message
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
