import { SocialsSection } from "@/app/_components/socials-section";
import { ThemeSelector } from "@/app/_components/theme-selector";

export function Footer() {
  return (
    <footer className="flex items-center gap-4 flex-col md:flex-row mt-8">
      <ThemeSelector />
      <SocialsSection />
    </footer>
  );
}
