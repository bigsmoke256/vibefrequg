import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Header } from "@/components/vibefreq/Header";
import { Footer } from "@/components/vibefreq/Footer";
import { StoryCard } from "@/components/vibefreq/StoryCard";
import { SectionLabel } from "@/components/vibefreq/SectionLabel";
import { tagStoriesQuery } from "@/lib/queries";

export const Route = createFileRoute("/tag/$slug")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(tagStoriesQuery(params.slug)),
  head: ({ params, loaderData }) => {
    const name = loaderData?.tag?.name ?? params.slug;
    const title = `#${name} stories | VibeFreq`;
    const description = `Every VibeFreq story tagged ${name} — music, tech, culture and hustle.`;
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
  component: TagPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="text-4xl uppercase">Something broke</h1>
      <p className="mt-4 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="text-4xl uppercase">Tag not found</h1>
      <Link to="/" className="mt-4 inline-block text-accent uppercase">
        Back home
      </Link>
    </div>
  ),
});

function TagPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(tagStoriesQuery(slug));
  const stories = data?.stories ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-[1500px] px-4 py-12 sm:px-6">
        <SectionLabel>Tagged</SectionLabel>
        <h1 className="mt-3 text-5xl leading-none uppercase">#{data?.tag?.name ?? slug}</h1>
        {stories.length ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stories.map((s) => (
              <StoryCard key={s.id} story={s} aspect="aspect-[4/3]" />
            ))}
          </div>
        ) : (
          <p className="mt-8 text-sm text-muted-foreground">No stories with this tag yet.</p>
        )}
      </main>
      <Footer />
    </div>
  );
}
