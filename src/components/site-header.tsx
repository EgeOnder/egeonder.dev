"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";

import { useNavbarTitle } from "@/components/navbar-title-context";
import { MenuIcon, type MenuIconHandle } from "@/components/ui/menu";
import CenterUnderline from "./ui/underline-center";

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
      <nav className="fixed left-0 right-0 top-0 z-50 h-16 bg-transparent backdrop-blur-md">
        <div className="mx-auto flex h-full w-7/8 items-center justify-between md:w-3/4">
          <Link href="/" className="flex min-w-0 cursor-pointer select-none items-center gap-2" prefetch>
            <span className="mt-0.5 text-orange-700">✽</span>
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
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.99 }} transition={{ type: "spring", stiffness: 320, damping: 24 }}>
            <MenuIcon ref={menuIconRef} className="cursor-pointer" onClick={toggleMenuIcon} size={20} />
          </motion.div>
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
            className="fixed inset-x-0 bottom-0 top-16 z-40 bg-transparent backdrop-blur-md"
          >
            <nav className="mx-auto flex h-full w-7/8 items-center md:w-3/4">
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
