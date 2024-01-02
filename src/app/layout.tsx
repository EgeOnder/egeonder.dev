import { ThemeProvider } from "~/components/theme-provider";
import "./globals.css";
import { Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import Container from "~/components/container";
import { Separator } from "~/components/ui/separator";
import Navbar from "~/components/navbar";
import { CommandMenu } from "~/components/command-menu";
import { cn } from "~/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "egeonder.dev",
  description: "This is where I have fun writing about stuff about the web.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          inter.className,
          "selection:bg-blue-700 selection:text-white",
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Container>
            <div className="relative min-h-screen">
              <Navbar />
              <Separator className="mb-4" />
              <main className="mb-16">{children}</main>
              <div className="fixed bottom-0 left-0 flex w-full justify-center border-t bg-background py-1">
                <CommandMenu />
              </div>
            </div>
          </Container>
        </ThemeProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
