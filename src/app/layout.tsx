import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";
import { AccentThemeProvider } from "@/components/accent-theme-provider";
import { NavbarTitleProvider } from "@/components/navbar-title-context";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { Glow } from "@/components/ui/glow";
import { TooltipProvider } from "@/components/ui/tooltip";
import { defaultMetadataRobots, defaultOpenGraphImage, defaultTwitterProfile, getMetadataBase, sharedKeywords, sharedMetadata } from "@/lib/metadata";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const overusedGrotesk = localFont({
  src: "../../public/fonts/OverusedGrotesk-VF.woff2",
  variable: "--font-overused-grotesk",
});

const calendasPlus = localFont({
  src: "../../public/fonts/calendas_plus-webfont.woff2",
  variable: "--font-calendas-plus",
});

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  applicationName: sharedMetadata.title,
  title: {
    default: sharedMetadata.title,
    template: `%s — ${sharedMetadata.title}`,
  },
  description: sharedMetadata.description,
  referrer: "origin-when-cross-origin",
  keywords: [...sharedKeywords],
  authors: [{ name: sharedMetadata.authorName, url: sharedMetadata.siteUrl }],
  creator: sharedMetadata.authorName,
  publisher: sharedMetadata.authorName,
  category: "technology",
  classification: "Personal website and engineering blog",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: defaultMetadataRobots,
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/",
    },
  },
  openGraph: {
    title: sharedMetadata.title,
    description: sharedMetadata.description,
    type: "website",
    url: "/",
    siteName: sharedMetadata.title,
    locale: sharedMetadata.locale,
    images: [
      {
        ...defaultOpenGraphImage,
      },
    ],
  },
  twitter: {
    ...defaultTwitterProfile,
    card: "summary_large_image",
    title: sharedMetadata.title,
    description: sharedMetadata.description,
    images: ["/twitter-image"],
  },
  icons: {
    icon: [
      { url: "/icon", media: "(prefers-color-scheme: light)", type: "image/svg+xml" },
      {
        url: "/icon1",
        media: "(prefers-color-scheme: dark)",
        type: "image/svg+xml",
      },
    ],
  },
  other: {
    pinterest: "nopin",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${overusedGrotesk.variable} ${calendasPlus.variable}`}>
      <body className={`${overusedGrotesk.variable} ${calendasPlus.variable} antialiased relative min-h-dvh overflow-x-hidden`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AccentThemeProvider>
            <div className="relative z-10">
              <NavbarTitleProvider>
                <SiteHeader />
                <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
                  <Glow variant="center" className="-left-[35vw] top-1/3 w-[70vw] opacity-80" />
                  <Glow variant="center" className="-right-[35vw] top-2/3 w-[70vw] opacity-80" />
                </div>
                <TooltipProvider>
                  <Analytics />
                  <SpeedInsights />
                  <main className="mx-auto md:w-3/4 w-7/8 pt-16">{children}</main>
                </TooltipProvider>
              </NavbarTitleProvider>
            </div>
          </AccentThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
