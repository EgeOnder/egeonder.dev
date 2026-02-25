"use client";

import { useEffect } from "react";

import { useNavbarTitle } from "@/components/navbar-title-context";

const BLOG_TITLE_ID = "blog-post-title";
const NAVBAR_HEIGHT = 64;
const NAVBAR_OFFSET = 8;

type BlogNavbarTitleSyncProps = {
  title: string;
};

export function BlogNavbarTitleSync({ title }: BlogNavbarTitleSyncProps) {
  const { setTitle, resetTitle } = useNavbarTitle();

  useEffect(() => {
    const titleElement = document.getElementById(BLOG_TITLE_ID);

    if (!titleElement) {
      resetTitle();
      return;
    }

    let frameId: number | null = null;

    const updateNavbarTitle = () => {
      const titleRect = titleElement.getBoundingClientRect();
      const hasPassedTitle = titleRect.top <= NAVBAR_HEIGHT + NAVBAR_OFFSET;

      if (hasPassedTitle) {
        setTitle(title);
        return;
      }

      resetTitle();
    };

    const scheduleUpdate = () => {
      if (frameId !== null) {
        return;
      }

      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        updateNavbarTitle();
      });
    };

    updateNavbarTitle();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      resetTitle();
    };
  }, [resetTitle, setTitle, title]);

  return null;
}
