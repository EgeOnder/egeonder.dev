"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { LaptopMinimalIcon, MoonStarIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useRef, useState } from "react";

import { useNavbarTitle } from "@/components/navbar-title-context";
import { MenuIcon, type MenuIconHandle } from "@/components/ui/menu";
import CenterUnderline from "./ui/underline-center";

const THEME_MODE_ORDER = ["light", "dark", "system"] as const;

type ThemeMode = (typeof THEME_MODE_ORDER)[number];

function isThemeMode(value: string | undefined): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

function ThemeModeToggle() {
  const { theme, setTheme } = useTheme();
  const currentMode: ThemeMode = isThemeMode(theme) ? theme : "system";
  const currentModeIndex = THEME_MODE_ORDER.indexOf(currentMode);
  const nextMode = THEME_MODE_ORDER[(currentModeIndex + 1) % THEME_MODE_ORDER.length];

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.07 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 330, damping: 24 }}
      onClick={() => setTheme(nextMode)}
      aria-label={`Theme mode is ${currentMode}. Switch to ${nextMode}.`}
      className="flex h-8 w-8 items-center justify-center text-foreground"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={currentMode} initial={{ opacity: 0, y: 6, rotate: -8 }} animate={{ opacity: 1, y: 0, rotate: 0 }} exit={{ opacity: 0, y: -6, rotate: 8 }} transition={{ duration: 0.1 }}>
          {currentMode === "light" ? <SunIcon className="size-4" /> : null}
          {currentMode === "dark" ? <MoonStarIcon className="size-4" /> : null}
          {currentMode === "system" ? <LaptopMinimalIcon className="size-4" /> : null}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuIconRef = useRef<MenuIconHandle>(null);
  const { title: navbarTitle } = useNavbarTitle();

  const closeMenu = () => {
    setIsMenuOpen(false);
    menuIconRef.current?.stopAnimation();
  };

  const setMenuOpenState = (nextIsMenuOpen: boolean) => {
    setIsMenuOpen(nextIsMenuOpen);

    if (nextIsMenuOpen) {
      menuIconRef.current?.startAnimation();
      return;
    }

    menuIconRef.current?.stopAnimation();
  };

  const toggleMenuIcon = () => {
    setMenuOpenState(!isMenuOpen);
  };

  return (
    <>
      <nav className="site-header-surface fixed left-0 right-0 top-0 z-50 h-(--site-header-height) pt-(--safe-area-inset-top) backdrop-blur-md">
        <div className="mx-auto flex h-16 w-7/8 items-center justify-between md:w-3/4">
          <Link href="/" className="flex min-w-0 cursor-pointer select-none items-center gap-2" prefetch>
            <span className="mt-0.5" style={{ color: "var(--accent-logo)" }}>
              ✽
            </span>
            <span className="block h-7 max-w-[min(62vw,32rem)] overflow-hidden">
              <AnimatePresence initial={false} mode="wait">
                <motion.span
                  key={navbarTitle}
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -16, opacity: 0 }}
                  transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="block truncate pr-1 text-lg leading-7"
                >
                  {navbarTitle}
                </motion.span>
              </AnimatePresence>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeModeToggle />
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.99 }} transition={{ type: "spring", stiffness: 320, damping: 24 }}>
              <MenuIcon ref={menuIconRef} className="cursor-pointer" onClick={toggleMenuIcon} size={20} />
            </motion.div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen ? (
          <motion.aside
            key="mobile-nav-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 bottom-0 top-(--site-header-height) z-40"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 bottom-(--safe-area-inset-bottom) bg-background/5 backdrop-blur-md"
            />
            <nav className="relative mx-auto flex h-full w-7/8 items-center pb-(--safe-area-inset-bottom) md:w-3/4">
              <ul className="flex flex-col gap-5">
                <li>
                  <CenterUnderline>
                    <Link href="/" onClick={closeMenu} className="text-4xl font-medium tracking-widest uppercase" prefetch>
                      Home
                    </Link>
                  </CenterUnderline>
                </li>
                <li>
                  <CenterUnderline>
                    <Link href="/blog" onClick={closeMenu} className="text-4xl font-medium tracking-widest uppercase" prefetch>
                      Blog
                    </Link>
                  </CenterUnderline>
                </li>
              </ul>
            </nav>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  );
}
