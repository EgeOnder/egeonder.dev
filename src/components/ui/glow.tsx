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

const Glow = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof glowVariants>
>(({ className, variant, ...props }, ref) => (
	<div
		ref={ref}
		className={cn(glowVariants({ variant }), className)}
		{...props}
	>
		<div
			className={cn(
				"absolute left-1/2 h-[256px] w-[60%] -translate-x-1/2 scale-[2.5] rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.12)_10%,rgba(249,115,22,0)_45%)] sm:h-[512px]",
				variant === "center" && "-translate-y-1/2",
			)}
		/>
		<div
			className={cn(
				"absolute left-1/2 h-[128px] w-[40%] -translate-x-1/2 scale-[2] rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(251,146,60,0.12)_5%,rgba(251,146,60,0)_10%)] sm:h-[256px]",
				variant === "center" && "-translate-y-1/2",
			)}
		/>
	</div>
));
Glow.displayName = "Glow";

export { Glow };
