"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

const DEFAULT_NAVBAR_TITLE = "egeonder.dev";

type NavbarTitleContextValue = {
  title: string;
  setTitle: (nextTitle: string) => void;
  resetTitle: () => void;
};

const NavbarTitleContext = createContext<NavbarTitleContextValue | null>(null);

type NavbarTitleProviderProps = {
  children: React.ReactNode;
};

export function NavbarTitleProvider({ children }: NavbarTitleProviderProps) {
  const [title, setTitleState] = useState(DEFAULT_NAVBAR_TITLE);

  const setTitle = useCallback((nextTitle: string) => {
    const trimmedTitle = nextTitle.trim();
    setTitleState(trimmedTitle.length > 0 ? trimmedTitle : DEFAULT_NAVBAR_TITLE);
  }, []);

  const resetTitle = useCallback(() => {
    setTitleState(DEFAULT_NAVBAR_TITLE);
  }, []);

  const value = useMemo(
    () => ({
      title,
      setTitle,
      resetTitle,
    }),
    [resetTitle, setTitle, title],
  );

  return <NavbarTitleContext value={value}>{children}</NavbarTitleContext>;
}

export function useNavbarTitle() {
  const context = useContext(NavbarTitleContext);

  if (!context) {
    throw new Error("useNavbarTitle must be used inside NavbarTitleProvider.");
  }

  return context;
}
