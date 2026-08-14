import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { adminStoriesQuery, myAccountQuery } from "@/lib/queries";
import { setStoryStatus } from "@/lib/admin.functions";
import { formatDate } from "@/lib/story-types";

export const Route = createFileRoute("/_authenticated/admin/review")({
  component: ReviewQueue,
});

function ReviewQueue() {
  const { data, isLoading } = useQuery(adminStoriesQuery({ status: "in_review" }));
  const { data: me } = useQuery(myAccountQuery);
  const changeStatus = useServerFn(setStoryStatus);
  const queryClient = useQueryClient();

  const act = async (id: string, status: "published" | "draft" | "archived") => {
    const result = await changeStatus({ data: { id, status } });
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    await queryClient.invalidateQueries();
    toast.success(status === "published" ? "Published" : "Updated");
  };

  return (
    <div>
      <h1 className="text-4xl leading-none uppercase">Review queue</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {me?.isEditorial
          ? "Approve to publish, send back to draft, or archive."
          : "Your submitted stories waiting on an editor."}
      </p>

      <div className="mt-8 border border-border/60">
        {isLoading ? (
          <p className="p-4 text-sm text-muted-foreground">Loading…</p>
        ) : (
          <ul className="divide-y divide-border/60">
            {(data?.stories ?? []).map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-4 p-4">
                {s.cover_image ? (
                  <img src={s.cover_image} alt="" className="h-14 w-24 object-cover" />
                ) : (
                  <div className="h-14 w-24 bg-secondary" />
                )}
                <div className="min-w-[240px] flex-1">
                  <Link
                    to="/admin/stories/$id/edit"
                    params={{ id: s.id }}
                    className="font-semibold hover:text-accent"
                  >
                    {s.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {s.category?.name ?? "Uncategorised"} · {s.author?.name ?? "Unassigned"} ·{" "}
                    {formatDate(s.published_at ?? null)}
                  </p>
                </div>
                {me?.isEditorial ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => act(s.id, "published")}
                      className="bg-accent px-4 py-2 text-xs font-bold tracking-[0.16em] text-accent-foreground uppercase"
                    >
                      Approve &amp; publish
                    </button>
                    <button
                      onClick={() => act(s.id, "draft")}
                      className="border border-border px-4 py-2 text-xs font-bold tracking-[0.16em] uppercase hover:border-accent hover:text-accent"
                    >
                      Send back
                    </button>
                    <button
                      onClick={() => act(s.id, "archived")}
                      className="border border-border px-4 py-2 text-xs font-bold tracking-[0.16em] uppercase hover:border-accent hover:text-accent"
                    >
                      Archive
                    </button>
                  </div>
                ) : (
                  <span className="text-xs tracking-[0.16em] text-accent uppercase">
                    Awaiting editor
                  </span>
                )}
              </li>
            ))}
            {!data?.stories.length ? (
              <li className="p-4 text-sm text-muted-foreground">Nothing in review.</li>
            ) : null}
          </ul>
        )}
      </div>
    </div>
  );
}
