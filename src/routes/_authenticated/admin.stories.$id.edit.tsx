import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { StoryForm } from "@/components/admin/StoryForm";
import { adminStoryQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/admin/stories/$id/edit")({
  component: EditStory,
  errorComponent: ({ error }) => (
    <p className="text-sm text-destructive">{error.message}</p>
  ),
});

function EditStory() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery(adminStoryQuery(id));

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!data?.story)
    return (
      <div>
        <p className="text-sm text-muted-foreground">
          Story not found, or your role can't access it.
        </p>
        <Link to="/admin/stories" className="mt-4 inline-block text-xs text-accent uppercase">
          Back to stories
        </Link>
      </div>
    );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl leading-none uppercase">Edit story</h1>
        {data.story.status === "published" ? (
          <Link
            to="/story/$slug"
            params={{ slug: data.story.slug }}
            className="text-xs tracking-[0.16em] text-accent uppercase"
          >
            View live →
          </Link>
        ) : null}
      </div>
      <div className="mt-8">
        <StoryForm existing={data.story} />
      </div>
    </div>
  );
}
