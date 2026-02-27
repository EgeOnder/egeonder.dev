"use client";

import { ArrowRightIcon } from "@/components/ui/arrow-right";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import UnderlineCenter from "@/components/ui/underline-center";
import { getBlogViewTransitionNames } from "@/lib/blog-view-transition";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ViewTransition } from "react";

export function WritingCard({
  slug,
  title,
  description,
  date,
  readingTime,
}: {
  slug: string;
  title: string;
  description: string;
  date: string;
  readingTime?: string;
  author?: string;
}) {
  const href = `/blog/${slug}`;
  const imageSrc = `/blog/${slug}/thumbnail.png`;
  const imageAlt = `${title} Thumbnail`;
  const viewTransitionNames = getBlogViewTransitionNames(slug);
  const iconRef = useRef<React.ElementRef<typeof ArrowRightIcon>>(null);
  const metaRowRef = useRef<HTMLDivElement>(null);
  const metaBaseRef = useRef<HTMLDivElement>(null);
  const readTimeMeasureRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showReadTime, setShowReadTime] = useState(true);
  const [descriptionClampClass, setDescriptionClampClass] = useState("line-clamp-2");

  useEffect(() => {
    const updateDescriptionClamp = () => {
      const titleElement = titleRef.current;
      if (!titleElement) return;

      const lineHeight = Number.parseFloat(window.getComputedStyle(titleElement).lineHeight);
      if (!Number.isFinite(lineHeight) || lineHeight <= 0) {
        setDescriptionClampClass("line-clamp-2");
        return;
      }

      const renderedLineCount = Math.round(titleElement.clientHeight / lineHeight);
      setDescriptionClampClass(renderedLineCount <= 1 ? "line-clamp-3" : "line-clamp-2");
    };

    updateDescriptionClamp();

    const resizeObserver = new ResizeObserver(updateDescriptionClamp);
    if (titleRef.current) {
      resizeObserver.observe(titleRef.current);
    }

    window.addEventListener("resize", updateDescriptionClamp);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateDescriptionClamp);
    };
  }, [title]);

  useEffect(() => {
    const updateReadTimeVisibility = () => {
      const metaRow = metaRowRef.current;
      const metaBase = metaBaseRef.current;
      const readTimeMeasure = readTimeMeasureRef.current;
      if (!metaRow || !metaBase || !readTimeMeasure) return;
      if (!readingTime) {
        setShowReadTime(false);
        return;
      }

      const availableWidth = metaRow.clientWidth;
      const baseWidth = metaBase.offsetWidth;
      const readTimeWidth = readTimeMeasure.offsetWidth;
      const gapWidth = 8;

      setShowReadTime(availableWidth >= baseWidth + gapWidth + readTimeWidth);
    };

    updateReadTimeVisibility();

    const resizeObserver = new ResizeObserver(() => {
      updateReadTimeVisibility();
    });

    if (metaRowRef.current) {
      resizeObserver.observe(metaRowRef.current);
    }

    window.addEventListener("resize", updateReadTimeVisibility);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateReadTimeVisibility);
    };
  }, [date, readingTime]);

  return (
    <Link href={href} className="block" prefetch>
      <motion.div
        className="rounded-xl group w-full space-y-4 flex flex-col items-center group cursor-pointer h-full justify-between"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
        onMouseEnter={() => {
          setIsHovered(true);
          iconRef.current?.startAnimation();
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          iconRef.current?.stopAnimation();
        }}
      >
        <div className="space-y-4">
          <ViewTransition name={viewTransitionNames.image}>
            <div className="w-full max-w-sm">
              <AspectRatio ratio={16 / 9} className="bg-muted w-full rounded-xl">
                <Image src={imageSrc} alt={imageAlt} fill className="rounded-xl object-cover dark:brightness-20 border" />
              </AspectRatio>
            </div>
          </ViewTransition>
          <div className="flex flex-col gap-0.5">
            <ViewTransition name={viewTransitionNames.title}>
              <span ref={titleRef} className="text-xl font-medium w-auto line-clamp-2">
                {title}
              </span>
            </ViewTransition>
            <ViewTransition name={viewTransitionNames.description}>
              <p className={`text-lg text-muted-foreground ${descriptionClampClass}`}>{description}</p>
            </ViewTransition>
          </div>
        </div>
        <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <ViewTransition name={viewTransitionNames.meta}>
            <div ref={metaRowRef} className="min-w-0 flex items-center gap-2 overflow-hidden whitespace-nowrap">
              <div ref={metaBaseRef} className="flex items-center gap-2 flex-none">
                <span className="text-muted-foreground flex-none">{date}</span>
              </div>
              {showReadTime && readingTime ? (
                <>
                  <span className="text-muted-foreground flex-none">•</span>
                  <span className="text-muted-foreground flex-none">{readingTime}</span>
                </>
              ) : null}
            </div>
          </ViewTransition>
          <div className="flex items-center gap-2 flex-none text-muted-foreground cursor-pointer">
            <UnderlineCenter isActive={isHovered}>Read more</UnderlineCenter>
            <ArrowRightIcon ref={iconRef} size={16} />
          </div>
        </div>
        <span ref={readTimeMeasureRef} className="invisible absolute pointer-events-none whitespace-nowrap">
          {readingTime ?? ""}
        </span>
      </motion.div>
    </Link>
  );
}
