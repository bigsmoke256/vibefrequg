import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/vibefreq/Header";
import { Hero } from "@/components/vibefreq/Hero";
import { EditorsPickStrip } from "@/components/vibefreq/EditorsPickStrip";
import { LatestStories } from "@/components/vibefreq/LatestStories";
import { Voices } from "@/components/vibefreq/Voices";
import { EditorsFeature } from "@/components/vibefreq/EditorsFeature";
import { Newsletter } from "@/components/vibefreq/Newsletter";
import { Footer } from "@/components/vibefreq/Footer";
import { TrendingTicker } from "@/components/vibefreq/TrendingTicker";

const title = "VibeFreq — Music. Tech. Culture. Hustle.";
const description =
  "VibeFreq is a global lifestyle and culture blog covering music, entertainment, tech and AI, fashion, business and African culture.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <EditorsPickStrip />
        <LatestStories />
        <section className="mx-auto max-w-[1500px] px-4 pb-12 sm:px-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <Voices />
            <EditorsFeature />
          </div>
        </section>
        <Newsletter />
      </main>
      <Footer />
      <TrendingTicker />
    </div>
  );
}
