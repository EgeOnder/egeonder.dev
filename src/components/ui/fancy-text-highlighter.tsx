"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";

import { cn } from "@/lib/utils";

type FancyTextHighlighterProps = {
  children: React.ReactNode;
  className?: string;
  color?: string;
  animateOnView?: boolean;
  delay?: number;
};

export function FancyTextHighlighter({
  children,
  className,
  color = "rgba(255, 219, 88, 0.78)",
  animateOnView = true,
  delay = 0,
}: FancyTextHighlighterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { amount: 0.8, once: true });
  const active = animateOnView ? inView : true;

  return (
    <motion.span
      ref={ref}
      className={cn("inline", className)}
      style={{
        backgroundImage: `linear-gradient(120deg, ${color}, ${color})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "0 88%",
        paddingInline: "0.18em",
      }}
      initial={{ backgroundSize: "0% 42%" }}
      animate={{ backgroundSize: active ? "100% 42%" : "0% 42%" }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
    >
      {children}
    </motion.span>
  );
}
