"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/utils";

type SplitMode = "words" | "characters" | "lines" | string;

type FancyTextRotateProps = {
  texts: string[];
  className?: string;
  splitBy?: SplitMode;
  rotationInterval?: number;
  staggerDuration?: number;
  loop?: boolean;
};

function splitText(value: string, mode: SplitMode) {
  if (mode === "words") {
    return value.split(" ").filter(Boolean);
  }

  if (mode === "lines") {
    return value.split("\n").filter(Boolean);
  }

  if (mode === "characters") {
    return Array.from(value);
  }

  return value.split(mode).filter(Boolean);
}

export function FancyTextRotate({
  texts,
  className,
  splitBy = "characters",
  rotationInterval = 2600,
  staggerDuration = 0.02,
  loop = true,
}: FancyTextRotateProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (texts.length < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((current) => {
        if (!loop && current >= texts.length - 1) {
          return current;
        }
        return (current + 1) % texts.length;
      });
    }, rotationInterval);

    return () => {
      window.clearInterval(timer);
    };
  }, [loop, rotationInterval, texts.length]);

  const current = texts[index] ?? "";
  const pieces = useMemo(() => splitText(current, splitBy), [current, splitBy]);

  return (
    <span className={cn("inline-block overflow-hidden align-middle", className)}>
      <AnimatePresence mode="wait">
        <motion.span
          key={`${current}-${index}`}
          className="inline-flex flex-wrap"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {pieces.map((piece, pieceIndex) => (
            <motion.span
              key={`${piece}-${pieceIndex}`}
              className={splitBy === "lines" ? "block w-full" : "inline-block"}
              initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{
                delay: pieceIndex * staggerDuration,
                duration: 0.28,
                ease: "easeOut",
              }}
            >
              {piece}
              {splitBy === "words" && pieceIndex < pieces.length - 1 ? "\u00A0" : ""}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
