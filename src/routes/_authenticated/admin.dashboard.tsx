import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { dashboardQuery, myAccountQuery } from "@/lib/queries";
import { statusLabels, formatDate, type StoryStatus } from "@/lib/story-types";

export const Route = createFileRoute("/_authenticated/admin/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { data, isLoading } = useQuery(dashboardQuery);
  const { data: me } = useQuery(myAccountQuery);

  const order: StoryStatus[] = ["draft", "in_review", "scheduled", "published", "archived"];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl leading-none uppercase">Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {me?.isEditorial
              ? "You can review, publish and archive stories."
              : "You can write and submit your own stories for review."}
          </p>
        </div>
        <Link
          to="/admin/stories/new"
          className="bg-accent px-5 py-3 text-xs font-bold tracking-[0.16em] text-accent-foreground uppercase"
        >
          New story
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {order.map((s) => (
          <div key={s} className="border border-border/60 bg-card/50 p-5">
            <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
              {statusLabels[s]}
            </p>
            <p className="mt-2 text-4xl text-accent">{data?.counts[s] ?? 0}</p>
          </div>
        ))}
        <div className="border border-border/60 bg-card/50 p-5">
          <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">Subscribers</p>
          <p className="mt-2 text-4xl text-accent">{data?.subscribers ?? 0}</p>
        </div>
      </div>

      <h2 className="mt-10 text-2xl uppercase">Recent activity</h2>
      {isLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
      ) : (
        <ul className="mt-4 divide-y divide-border/60 border border-border/60">
          {(data?.recent ?? []).map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <Link
                to="/admin/stories/$id/edit"
                params={{ id: r.id }}
                className="text-sm font-semibold hover:text-accent"
              >
                {r.title}
              </Link>
              <span className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="tracking-[0.16em] text-accent uppercase">
                  {statusLabels[r.status as StoryStatus]}
                </span>
                {formatDate(r.updated_at)}
              </span>
            </li>
          ))}
          {!data?.recent.length ? (
            <li className="p-4 text-sm text-muted-foreground">Nothing yet.</li>
          ) : null}
        </ul>
      )}
    </div>
  );
}
