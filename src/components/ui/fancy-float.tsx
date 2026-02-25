"use client";

import { useRef } from "react";
import { useAnimationFrame } from "motion/react";

import { cn } from "@/lib/utils";

type Axis3 = [number, number, number];

type FancyFloatProps = React.HTMLAttributes<HTMLDivElement> & {
  speed?: number;
  amplitude?: Axis3;
  rotationRange?: Axis3;
  timeOffset?: number;
};

export function FancyFloat({
  children,
  className,
  speed = 0.5,
  amplitude = [10, 30, 30],
  rotationRange = [15, 15, 7.5],
  timeOffset = 0,
  ...props
}: FancyFloatProps) {
  const ref = useRef<HTMLDivElement>(null);

  useAnimationFrame((time) => {
    if (!ref.current) {
      return;
    }

    const t = time * 0.001 * speed + timeOffset;
    const x = Math.sin(t * 1.1) * amplitude[0];
    const y = Math.cos(t * 0.9) * amplitude[1];
    const z = Math.sin(t * 0.7) * amplitude[2];

    const rx = Math.sin(t * 1.3) * rotationRange[0];
    const ry = Math.cos(t * 1.1) * rotationRange[1];
    const rz = Math.sin(t * 0.8) * rotationRange[2];

    ref.current.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, ${z.toFixed(2)}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg)`;
  });

  return (
    <div ref={ref} className={cn("will-change-transform", className)} {...props}>
      {children}
    </div>
  );
}
