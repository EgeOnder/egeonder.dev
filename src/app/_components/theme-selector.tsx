"use client";

import { ACCENT_THEME_OPTIONS, useAccentTheme } from "@/components/accent-theme-provider";
import type { AccentTheme } from "@/components/accent-theme-provider";
import { ColorSelector } from "@/components/color-selector";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

const accentColors = ACCENT_THEME_OPTIONS.map((option) => option.value);

export function ThemeSelector() {
  const { accentTheme, setAccentTheme } = useAccentTheme();
  const hasHydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const renderedTheme = hasHydrated ? accentTheme : ACCENT_THEME_OPTIONS[0].value;

  return (
    <ColorSelector
      colors={accentColors}
      defaultValue={renderedTheme}
      onColorSelect={(color) => setAccentTheme(color as AccentTheme)}
      size="lg"
    />
  );
}
