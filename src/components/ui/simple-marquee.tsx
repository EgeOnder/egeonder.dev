"use client"

import { RefObject, useRef } from "react"
import {
  motion,
  SpringOptions,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react"

import { cn } from "@/lib/utils"

const wrap = (min: number, max: number, value: number): number => {
  const range = max - min
  return ((((value - min) % range) + range) % range) + min
}

interface SimpleMarqueeProps {
  children: React.ReactNode
  className?: string
  direction?: "left" | "right" | "up" | "down"
  baseVelocity?: number
  slowdownOnHover?: boolean
  slowDownFactor?: number
  slowDownSpringConfig?: SpringOptions
  useScrollVelocity?: boolean
  scrollAwareDirection?: boolean
  scrollSpringConfig?: SpringOptions
  scrollContainer?: RefObject<HTMLElement | null> | HTMLElement | null
  repeat?: number
}

const SimpleMarquee = ({
  children,
  className,
  direction = "right",
  baseVelocity = 5,
  slowdownOnHover = false,
  slowDownFactor = 0.3,
  slowDownSpringConfig = { damping: 50, stiffness: 400 },
  useScrollVelocity: useScrollVelocityProp = false,
  scrollAwareDirection = false,
  scrollSpringConfig = { damping: 50, stiffness: 400 },
  scrollContainer,
  repeat = 3,
}: SimpleMarqueeProps) => {
  const baseX = useMotionValue(0)
  const baseY = useMotionValue(0)

  const { scrollY } = useScroll({
    ...(scrollContainer && {
      container: scrollContainer as RefObject<HTMLDivElement>,
    }),
  })

  const scrollVelocity = useVelocity(scrollY)
  const smoothVelocity = useSpring(scrollVelocity, scrollSpringConfig)

  const hoverFactorValue = useMotionValue(1)
  const defaultVelocity = useMotionValue(1)

  const smoothHoverFactor = useSpring(hoverFactorValue, slowDownSpringConfig)

  const velocityFactor = useTransform(
    useScrollVelocityProp ? smoothVelocity : defaultVelocity,
    [0, 1000],
    [0, 5],
    { clamp: false }
  )

  const isHorizontal = direction === "left" || direction === "right"

  const actualBaseVelocity =
    direction === "left" || direction === "up" ? -baseVelocity : baseVelocity

  const isHovered = useRef(false)
  const directionFactor = useRef(1)

  const x = useTransform(baseX, (v) => {
    const wrappedValue = wrap(0, -100, v)
    return `${wrappedValue}%`
  })

  const y = useTransform(baseY, (v) => {
    const wrappedValue = wrap(0, -100, v)
    return `${wrappedValue}%`
  })

  useAnimationFrame((t, delta) => {
    if (isHovered.current) {
      hoverFactorValue.set(slowdownOnHover ? slowDownFactor : 1)
    } else {
      hoverFactorValue.set(1)
    }

    let moveBy =
      directionFactor.current *
      actualBaseVelocity *
      (delta / 1000) *
      smoothHoverFactor.get()

    if (scrollAwareDirection) {
      if (velocityFactor.get() < 0) {
        directionFactor.current = -1
      } else if (velocityFactor.get() > 0) {
        directionFactor.current = 1
      }
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get()

    if (isHorizontal) {
      baseX.set(baseX.get() + moveBy)
    } else {
      baseY.set(baseY.get() + moveBy)
    }
  })

  return (
    <motion.div
      className={cn("flex", isHorizontal ? "flex-row" : "flex-col", className)}
      onHoverStart={() => (isHovered.current = true)}
      onHoverEnd={() => (isHovered.current = false)}
    >
      {Array.from({ length: repeat }, (_, i) => i).map((i) => (
        <motion.div
          key={i}
          className={cn("shrink-0", isHorizontal && "flex")}
          style={isHorizontal ? { x } : { y }}
          aria-hidden={i > 0}
        >
          {children}
        </motion.div>
      ))}
    </motion.div>
  )
}

export default SimpleMarquee
