"use client"

import { useEffect, useRef } from "react"
import { motion, ValueAnimationTransition } from "motion/react"
import { cn } from "@/lib/utils"

interface UnderlineProps {
  children: React.ReactNode
  className?: string
  transition?: ValueAnimationTransition
  underlineHeightRatio?: number
  underlinePaddingRatio?: number
  isActive?: boolean
}

const CenterUnderline = ({
  children,
  className,
  transition = { duration: 0.25, ease: "easeInOut" },
  underlineHeightRatio = 0.1,
  underlinePaddingRatio = 0.01,
  isActive,
}: UnderlineProps) => {
  const textRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const updateUnderlineStyles = () => {
      if (textRef.current) {
        const fontSize = parseFloat(getComputedStyle(textRef.current).fontSize)
        const underlineHeight = fontSize * underlineHeightRatio
        const underlinePadding = fontSize * underlinePaddingRatio
        textRef.current.style.setProperty(
          "--underline-height",
          `${underlineHeight}px`
        )
        textRef.current.style.setProperty(
          "--underline-padding",
          `${underlinePadding}px`
        )
      }
    }

    updateUnderlineStyles()
    window.addEventListener("resize", updateUnderlineStyles)
    return () => window.removeEventListener("resize", updateUnderlineStyles)
  }, [underlineHeightRatio, underlinePaddingRatio])

  const underlineVariants = {
    hidden: { width: 0, originX: 0.5 },
    visible: { width: "100%", transition },
  }

  return (
    <motion.span
      className={cn("relative inline-block cursor-pointer", className)}
      initial="hidden"
      animate={isActive ? "visible" : "hidden"}
      whileHover={isActive === undefined ? "visible" : undefined}
      ref={textRef}
    >
      <span>{children}</span>
      <motion.div
        className="absolute left-1/2 bg-current -translate-x-1/2"
        style={{
          height: "var(--underline-height)",
          bottom: "calc(-1 * var(--underline-padding))",
        }}
        variants={underlineVariants}
        aria-hidden="true"
      />
    </motion.span>
  )
}

export default CenterUnderline
