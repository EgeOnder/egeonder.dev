"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const ACCENT_THEME_STORAGE_KEY = "accent-theme";
const DEFAULT_ACCENT_THEME = "pastel-orange";

export const ACCENT_THEME_OPTIONS = [
  { value: "pastel-orange", label: "Pastel orange", color: "#f2ad91" },
  { value: "pastel-green", label: "Pastel green", color: "#bde6cc" },
  { value: "pastel-blue", label: "Pastel blue", color: "#bedcf5" },
  { value: "pastel-purple", label: "Pastel purple", color: "#ddcbf2" },
] as const;

export type AccentTheme = (typeof ACCENT_THEME_OPTIONS)[number]["value"];

type AccentThemeContextValue = {
  accentTheme: AccentTheme;
  setAccentTheme: (theme: AccentTheme) => void;
};

const AccentThemeContext = createContext<AccentThemeContextValue | null>(null);

function isAccentTheme(value: string | null): value is AccentTheme {
  return ACCENT_THEME_OPTIONS.some((option) => option.value === value);
}

function getInitialAccentTheme(): AccentTheme {
  if (typeof window === "undefined") {
    return DEFAULT_ACCENT_THEME;
  }

  const storedTheme = window.localStorage.getItem(ACCENT_THEME_STORAGE_KEY);
  return isAccentTheme(storedTheme) ? storedTheme : DEFAULT_ACCENT_THEME;
}

export function AccentThemeProvider({ children }: { children: React.ReactNode }) {
  const [accentTheme, setAccentThemeState] = useState<AccentTheme>(getInitialAccentTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-accent-theme", accentTheme);
    window.localStorage.setItem(ACCENT_THEME_STORAGE_KEY, accentTheme);
  }, [accentTheme]);

  const setAccentTheme = useCallback((theme: AccentTheme) => {
    setAccentThemeState(theme);
  }, []);

  const value = useMemo(
    () => ({
      accentTheme,
      setAccentTheme,
    }),
    [accentTheme, setAccentTheme],
  );

  return <AccentThemeContext.Provider value={value}>{children}</AccentThemeContext.Provider>;
}

export function useAccentTheme() {
  const context = useContext(AccentThemeContext);

  if (!context) {
    throw new Error("useAccentTheme must be used within AccentThemeProvider");
  }

  return context;
}
