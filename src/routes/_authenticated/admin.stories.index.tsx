import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { adminStoriesQuery, refDataQuery } from "@/lib/queries";
import { statusLabels, formatDate, type StoryStatus } from "@/lib/story-types";

export const Route = createFileRoute("/_authenticated/admin/stories/")({
  component: StoriesList,
});

const STATUSES: (StoryStatus | "all")[] = [
  "all",
  "draft",
  "in_review",
  "scheduled",
  "published",
  "archived",
];

function StoriesList() {
  const [status, setStatus] = useState<StoryStatus | "all">("all");
  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [authorId, setAuthorId] = useState("");
  const { data: ref } = useQuery(refDataQuery);
  const { data, isLoading } = useQuery(
    adminStoriesQuery({
      status,
      ...(q ? { q } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(authorId ? { authorId } : {}),
    }),
  );

  const field =
    "border border-border bg-secondary px-3 py-2 text-sm outline-none focus:border-accent";

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-4xl leading-none uppercase">Stories</h1>
        <Link
          to="/admin/stories/new"
          className="bg-accent px-5 py-3 text-xs font-bold tracking-[0.16em] text-accent-foreground uppercase"
        >
          New story
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-4 py-2 text-xs font-bold tracking-[0.16em] uppercase ${
              status === s
                ? "bg-accent text-accent-foreground"
                : "border border-border text-muted-foreground hover:border-accent hover:text-accent"
            }`}
          >
            {s === "all" ? "All" : statusLabels[s]}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <input
          className={field}
          placeholder="Search titles…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className={field} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">All categories</option>
          {(ref?.categories ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select className={field} value={authorId} onChange={(e) => setAuthorId(e.target.value)}>
          <option value="">All authors</option>
          {(ref?.authors ?? []).map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 border border-border/60">
        {isLoading ? (
          <p className="p-4 text-sm text-muted-foreground">Loading…</p>
        ) : (
          <ul className="divide-y divide-border/60">
            {(data?.stories ?? []).map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-4 p-4">
                {s.cover_image ? (
                  <img src={s.cover_image} alt="" className="h-12 w-20 object-cover" />
                ) : (
                  <div className="h-12 w-20 bg-secondary" />
                )}
                <div className="min-w-[220px] flex-1">
                  <Link
                    to="/admin/stories/$id/edit"
                    params={{ id: s.id }}
                    className="text-sm font-semibold hover:text-accent"
                  >
                    {s.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {s.category?.name ?? "Uncategorised"} · {s.author?.name ?? "Unassigned"}
                  </p>
                </div>
                <span className="border border-accent/50 px-2 py-1 text-[10px] font-bold tracking-[0.16em] text-accent uppercase">
                  {statusLabels[s.status]}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(s.published_at ?? null)}
                </span>
                {s.status === "published" ? (
                  <Link
                    to="/story/$slug"
                    params={{ slug: s.slug }}
                    className="text-xs tracking-[0.16em] text-accent uppercase"
                  >
                    View
                  </Link>
                ) : null}
              </li>
            ))}
            {!data?.stories.length ? (
              <li className="p-4 text-sm text-muted-foreground">No stories match these filters.</li>
            ) : null}
          </ul>
        )}
      </div>
    </div>
  );
}
