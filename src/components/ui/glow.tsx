import type { VariantProps } from "class-variance-authority";
import React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const glowVariants = cva("absolute w-full", {
  variants: {
    variant: {
      top: "top-0",
      above: "-top-[128px]",
      bottom: "bottom-0",
      below: "-bottom-[128px]",
      center: "top-[50%]",
      custom: "",
    },
  },
  defaultVariants: {
    variant: "top",
  },
});

const Glow = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof glowVariants>>(({ className, variant, ...props }, ref) => (
  <div ref={ref} className={cn(glowVariants({ variant }), className)} {...props}>
    <div className={cn("theme-glow-primary absolute left-1/2 h-64 w-[60%] -translate-x-1/2 scale-[2.5] rounded-[50%] sm:h-128", variant === "center" && "-translate-y-1/2")} />
    <div className={cn("theme-glow-secondary absolute left-1/2 h-32 w-[40%] -translate-x-1/2 scale-[2] rounded-[50%] sm:h-64", variant === "center" && "-translate-y-1/2")} />
  </div>
));
Glow.displayName = "Glow";

export { Glow };
