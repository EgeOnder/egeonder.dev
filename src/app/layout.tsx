import { ThemeProvider } from "~/components/theme-provider";
import "./globals.css";
import { Inter } from "next/font/google";
import { env } from "~/env.mjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: env.NODE_ENV === "development" ? "Ege Onder - DEV" : "Ege Onder",
  description: "This is where I have fun writing about stuff about the web.",
};

export const runtime = "edge";

interface ContainerProps {
  children?: React.ReactNode;
}

const Container = ({ children }: ContainerProps) => (
  <div className="container mx-auto max-w-screen-md">{children}</div>
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Container>{children}</Container>
        </ThemeProvider>
      </body>
    </html>
  );
}
