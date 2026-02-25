"use client";

import { useEffect } from "react";

export function ReportView({ slug }: { slug: string }) {
  useEffect(() => {
    const body = JSON.stringify({ slug });

    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/views", blob);
      return;
    }

    fetch("/api/views", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      // ignore
    });
  }, [slug]);

  return null;
}
