import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesGrid } from "@/components/home/FeaturesGrid";
import { TrendingFunds } from "@/components/home/TrendingFunds";
import { ToolsSection } from "@/components/home/ToolsSection";
import { getSiteSettings } from "@/lib/payload-site-settings";

export const revalidate = 3600 // Revalidate every hour

/*
  Note: MapPreview, Testimonials, and BottomCTA are omitted for brevity in MVP phase 1,
  but typically would be included here.
*/

export default async function Home() {
  const siteSettings = await getSiteSettings()
  const heroTickers = siteSettings?.heroTickers?.map((t: { ticker: string }) => t.ticker).filter(Boolean)

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Header />
      {siteSettings?.announcement && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-primary text-white text-sm text-center py-1.5 px-4">
          {siteSettings.announcement}
        </div>
      )}
      <main>
        <HeroSection heroTickers={heroTickers} />
        <TrendingFunds />
        <FeaturesGrid />
        <ToolsSection />
      </main>
    </div>
  );
}
