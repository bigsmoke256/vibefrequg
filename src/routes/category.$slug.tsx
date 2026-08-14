import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/vibefreq/Header";
import { Footer } from "@/components/vibefreq/Footer";
import { TrendingTicker } from "@/components/vibefreq/TrendingTicker";
import { SectionLabel } from "@/components/vibefreq/SectionLabel";
import { StoryCard } from "@/components/vibefreq/StoryCard";
import { stories, categorySlug } from "@/data/stories";

export const Route = createFileRoute("/category/$slug")({
  head: ({ params }) => {
    const name = params.slug.charAt(0).toUpperCase() + params.slug.slice(1);
    const title = `${name} Stories | VibeFreq`;
    const description = `The latest ${name.toLowerCase()} stories from VibeFreq — music, tech, culture and hustle from Africa to the world.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const list = stories.filter((s) => categorySlug(s.category) === slug);
  const name = slug.charAt(0).toUpperCase() + slug.slice(1);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-[1500px] px-4 py-12 sm:px-6">
        <SectionLabel sub={`${list.length} stories`}>{name}</SectionLabel>
        {list.length ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((s) => (
              <StoryCard key={s.id} story={s} aspect="aspect-[4/3]" />
            ))}
          </div>
        ) : (
          <p className="mt-6 text-muted-foreground">
            No stories here yet.{" "}
            <Link to="/" className="text-accent">
              Back home
            </Link>
          </p>
        )}
      </main>
      <Footer />
      <TrendingTicker />
    </div>
  );
}
