import { Footer } from "@/components/footer";
import { AboutText } from "./_components/about-text";
import { WritingsSection } from "./_components/writings-section";

export default async function Page() {
  return (
    <div className="space-y-8 pt-4 pb-12">
      <AboutText />
      <WritingsSection limit={3} />
      <Footer />
    </div>
  );
}
