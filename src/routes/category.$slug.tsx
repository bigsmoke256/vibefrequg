import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Header } from "@/components/vibefreq/Header";
import { Footer } from "@/components/vibefreq/Footer";
import { TrendingTicker } from "@/components/vibefreq/TrendingTicker";
import { SectionLabel } from "@/components/vibefreq/SectionLabel";
import { StoryCard } from "@/components/vibefreq/StoryCard";
import { homepageQuery } from "@/lib/queries";
import { categorySlug } from "@/lib/categories";

export const Route = createFileRoute("/category/$slug")({
  loader: ({ context }) => context.queryClient.ensureQueryData(homepageQuery),
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
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="text-4xl uppercase">Something broke</h1>
      <p className="mt-4 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="text-4xl uppercase">Category not found</h1>
    </div>
  ),
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(homepageQuery);
  const list = data.stories.filter(
    (s) => s.category && (s.category.slug === slug || categorySlug(s.category.name) === slug),
  );
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
      <TrendingTicker trending={data.trending} />
    </div>
  );
}
