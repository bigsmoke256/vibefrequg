import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Header } from "@/components/vibefreq/Header";
import { Hero } from "@/components/vibefreq/Hero";
import { EditorsPickStrip } from "@/components/vibefreq/EditorsPickStrip";
import { LatestStories } from "@/components/vibefreq/LatestStories";
import { Voices } from "@/components/vibefreq/Voices";
import { EditorsFeature } from "@/components/vibefreq/EditorsFeature";
import { Newsletter } from "@/components/vibefreq/Newsletter";
import { Footer } from "@/components/vibefreq/Footer";
import { TrendingTicker } from "@/components/vibefreq/TrendingTicker";
import { homepageQuery } from "@/lib/queries";

const title = "VibeFreq — Music. Tech. Culture. Hustle.";
const description =
  "VibeFreq is a global lifestyle and culture blog covering music, entertainment, tech and AI, fashion, business and African culture.";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(homepageQuery),
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
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="text-4xl uppercase">VibeFreq</h1>
      <p className="mt-4 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="text-4xl uppercase">Not found</h1>
    </div>
  ),
});

function Index() {
  const { data } = useSuspenseQuery(homepageQuery);
  const stories = data?.stories ?? [];
  const trending = data?.trending ?? [];
  const categories = data?.categories ?? [];


  const heroStories = stories
    .filter((s) => s.is_hero)
    .sort((a, b) => (a.hero_position ?? 99) - (b.hero_position ?? 99));
  const heroList = heroStories.length ? heroStories : stories.slice(0, 4);
  const heroIds = new Set(heroList.slice(0, 4).map((s) => s.id));

  const picks = stories.filter((s) => s.is_editors_pick);
  const voices = stories.filter((s) => s.is_voice);
  const feature = picks[0] ?? null;

  const latest = stories.filter((s) => !heroIds.has(s.id) && !s.is_voice && !s.is_editors_pick);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero stories={heroList} />
        <EditorsPickStrip picks={picks} trending={trending} />
        <LatestStories
          stories={latest.length ? latest : stories}
          categories={categories.map((c) => c.name)}
        />

        <section className="mx-auto max-w-[1500px] px-4 pb-12 sm:px-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <Voices voices={voices} />
            <EditorsFeature story={feature} />
          </div>
        </section>
        <Newsletter />
      </main>
      <Footer />
      <TrendingTicker trending={trending} />
    </div>
  );
}
