import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import { Header } from "@/components/vibefreq/Header";
import { Footer } from "@/components/vibefreq/Footer";
import { TrendingTicker } from "@/components/vibefreq/TrendingTicker";
import { StoryCard } from "@/components/vibefreq/StoryCard";
import { SectionLabel } from "@/components/vibefreq/SectionLabel";
import { CategoryTag } from "@/components/vibefreq/CategoryTag";
import { storyQuery } from "@/lib/queries";
import { recordStoryView } from "@/lib/stories.functions";
import { formatDate } from "@/lib/story-types";

export const Route = createFileRoute("/story/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(storyQuery(params.slug));
    if (!data.story) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    const story = loaderData?.story;
    const title = story ? `${story.seo_title ?? story.title} | VibeFreq` : "Story | VibeFreq";
    const description =
      story?.seo_description ??
      story?.excerpt ??
      "Music, tech, culture and hustle from VibeFreq.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: StoryPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="text-4xl uppercase">Something broke</h1>
      <p className="mt-4 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="text-4xl uppercase">Story not found</h1>
      <Link to="/" className="mt-4 inline-block text-accent uppercase">
        Back home
      </Link>
    </div>
  ),
});

function StoryPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(storyQuery(slug));
  const story = data.story;

  useEffect(() => {
    if (story?.id) void recordStoryView({ data: { storyId: story.id } });
  }, [story?.id]);

  if (!story) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-[900px] px-4 py-12 sm:px-6">
        <CategoryTag category={story.category?.name ?? "VibeFreq"} />
        <h1 className="mt-3 text-4xl leading-[0.98] uppercase sm:text-6xl">{story.title}</h1>
        <p className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="text-foreground/80">By {story.author?.name ?? "VibeFreq Desk"}</span>
          <span>{formatDate(story.published_at)}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {story.read_minutes} min read
          </span>
        </p>
        {story.cover_image ? (
          <img
            src={story.cover_image}
            alt={story.title}
            width={1408}
            height={912}
            className="duotone mt-6 aspect-[16/9] w-full object-cover"
          />
        ) : null}
        {story.corrected_at ? (
          <p className="mt-4 border-l-2 border-accent pl-3 text-xs text-muted-foreground">
            Updated {formatDate(story.corrected_at)}
            {story.correction_note ? ` — ${story.correction_note}` : ""}
          </p>
        ) : null}
        {story.excerpt ? (
          <p className="mt-8 text-lg text-foreground/90">{story.excerpt}</p>
        ) : null}
        <div className="mt-6 grid gap-5">
          {(story.body ?? []).map((block, i) =>
            block.type === "heading" ? (
              <h2 key={i} className="mt-4 text-2xl uppercase">
                {block.text}
              </h2>
            ) : block.type === "quote" ? (
              <blockquote
                key={i}
                className="border-l-2 border-accent pl-4 text-lg text-foreground/90 italic"
              >
                {block.text}
              </blockquote>
            ) : (
              <p key={i} className="text-base leading-relaxed text-foreground/85">
                {block.text}
              </p>
            ),
          )}
        </div>

        {(story.tag_links ?? []).some((t) => t.tag) ? (
          <div className="mt-10 flex flex-wrap gap-2">
            {(story.tag_links ?? []).map((t) =>
              t.tag ? (
                <Link
                  key={t.tag.slug}
                  to="/tag/$slug"
                  params={{ slug: t.tag.slug }}
                  className="border border-border px-3 py-1.5 text-[10px] font-bold tracking-[0.16em] uppercase hover:border-accent hover:text-accent"
                >
                  #{t.tag.name}
                </Link>
              ) : null,
            )}
          </div>
        ) : null}

        {data.related.length ? (
          <section className="mt-16">
            <SectionLabel>More stories</SectionLabel>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {data.related.map((s) => (
                <StoryCard key={s.id} story={s} aspect="aspect-[4/3]" showMeta={false} />
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
      <TrendingTicker trending={data.related} />
    </div>
  );
}
