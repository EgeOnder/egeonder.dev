"use client";

import { ACCENT_THEME_OPTIONS, useAccentTheme } from "@/components/accent-theme-provider";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "motion/react";

export function ThemeSelector() {
  const { accentTheme, setAccentTheme } = useAccentTheme();

  return (
    <div className="flex items-center gap-3">
      {ACCENT_THEME_OPTIONS.map((option) => {
        const isActive = accentTheme === option.value;

        return (
          <Tooltip key={option.value}>
            <TooltipTrigger>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 320, damping: 24 }}
                type="button"
                aria-label={`Switch to ${option.label} theme`}
                onClick={() => setAccentTheme(option.value)}
                className={cn("h-6 w-6 rounded-full border-2", isActive ? "border-muted-foreground" : "border-transparent")}
                style={{ backgroundColor: option.color }}
              />
            </TooltipTrigger>
            <TooltipContent>{option.label}</TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
