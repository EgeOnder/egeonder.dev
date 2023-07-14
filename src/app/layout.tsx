import { ThemeProvider } from "~/components/theme-provider";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "egeonder.dev",
  description: "Personal page for Ege Önder",
};

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
