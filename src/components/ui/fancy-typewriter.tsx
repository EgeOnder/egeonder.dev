"use client";

import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

type FancyTypewriterProps = {
  texts: string[] | string;
  className?: string;
  cursorClassName?: string;
  cursor?: string;
  typeSpeed?: number;
  deleteSpeed?: number;
  pauseDuration?: number;
  loop?: boolean;
};

export function FancyTypewriter({
  texts,
  className,
  cursorClassName,
  cursor = "_",
  typeSpeed = 70,
  deleteSpeed = 40,
  pauseDuration = 1400,
  loop = true,
}: FancyTypewriterProps) {
  const source = useMemo(() => (Array.isArray(texts) ? texts : [texts]), [texts]);
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (source.length === 0) {
      return;
    }

    const activeText = source[textIndex] ?? "";
    const atEnd = charIndex >= activeText.length;
    const atStart = charIndex <= 0;

    if (!loop && textIndex === source.length - 1 && atEnd && !isDeleting) {
      return;
    }

    let timeout = isDeleting ? deleteSpeed : typeSpeed;
    if (!isDeleting && atEnd) {
      timeout = pauseDuration;
    } else if (isDeleting && atStart) {
      timeout = 220;
    }

    const id = window.setTimeout(() => {
      if (!isDeleting) {
        if (atEnd) {
          setIsDeleting(true);
          return;
        }
        setCharIndex((count) => count + 1);
        return;
      }

      if (atStart) {
        setIsDeleting(false);
        setTextIndex((current) => (current + 1) % source.length);
        return;
      }

      setCharIndex((count) => count - 1);
    }, timeout);

    return () => {
      window.clearTimeout(id);
    };
  }, [
    charIndex,
    deleteSpeed,
    isDeleting,
    loop,
    pauseDuration,
    source,
    textIndex,
    typeSpeed,
  ]);

  const activeText = source[textIndex] ?? "";
  const output = activeText.slice(0, charIndex);

  return (
    <span className={cn("inline-flex items-center", className)}>
      <span>{output}</span>
      <span className={cn("ml-1 inline-block animate-pulse", cursorClassName)}>{cursor}</span>
    </span>
  );
}
