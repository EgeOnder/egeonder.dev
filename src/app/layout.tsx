import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";
import { NavbarTitleProvider } from "@/components/navbar-title-context";
import { SiteHeader } from "@/components/site-header";
import { Glow } from "@/components/ui/glow";
import { TooltipProvider } from "@/components/ui/tooltip";

const overusedGrotesk = localFont({
  src: "../../public/fonts/OverusedGrotesk-VF.woff2",
  variable: "--font-overused-grotesk",
});

const calendasPlus = localFont({
  src: "../../public/fonts/calendas_plus-webfont.woff2",
  variable: "--font-calendas-plus",
});

export const metadata: Metadata = {
  title: "egeonder.dev",
  description: "egeonder.dev",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      {
        url: "/favicon-dark.ico",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${overusedGrotesk.variable} ${calendasPlus.variable}`}>
      <body className={`${overusedGrotesk.variable} ${calendasPlus.variable} antialiased relative min-h-dvh overflow-x-hidden`}>
        <div className="relative z-10">
          <NavbarTitleProvider>
            <SiteHeader />
            <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
              <Glow variant="center" className="-left-[35vw] top-1/3 w-[70vw] opacity-80" />
              <Glow variant="center" className="-right-[35vw] top-2/3 w-[70vw] opacity-80" />
            </div>
            <TooltipProvider>
              <main className="mx-auto md:w-3/4 w-7/8 pt-16">{children}</main>
            </TooltipProvider>
          </NavbarTitleProvider>
        </div>
      </body>
    </html>
  );
}
