import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesGrid } from "@/components/home/FeaturesGrid";
import { TrendingFunds } from "@/components/home/TrendingFunds";
import { ToolsSection } from "@/components/home/ToolsSection";

/* 
  Note: MapPreview, Testimonials, and BottomCTA are omitted for brevity in MVP phase 1,
  but typically would be included here.
*/

export default function Home() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Header />
      <main>
        <HeroSection />
        <TrendingFunds />
        <FeaturesGrid />
        <ToolsSection />
      </main>
    </div>
  );
}
