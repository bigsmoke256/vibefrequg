import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { saveStory, setStoryStatus, setStoryFlags, deleteStory } from "@/lib/admin.functions";
import { myAccountQuery, refDataQuery } from "@/lib/queries";
import { slugify, statusLabels, blocksToText } from "@/lib/story-types";
import type { StoryFullDTO, StoryStatus } from "@/lib/story-types";

const PRESET_IMAGES = [
  "/img/story-music.jpg",
  "/img/story-culture.jpg",
  "/img/story-style.jpg",
  "/img/story-tech.jpg",
  "/img/story-entertainment.jpg",
  "/img/editors-feature.jpg",
  "/img/hero-portrait.jpg",
  "/img/voice-1.jpg",
  "/img/voice-2.jpg",
  "/img/voice-3.jpg",
];

type Existing = StoryFullDTO & {
  category_id: string | null;
  author_id: string | null;
  created_by: string | null;
};

export function StoryForm({ existing }: { existing?: Existing }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: ref } = useQuery(refDataQuery);
  const { data: me } = useQuery(myAccountQuery);

  const save = useServerFn(saveStory);
  const changeStatus = useServerFn(setStoryStatus);
  const changeFlags = useServerFn(setStoryFlags);
  const removeStory = useServerFn(deleteStory);

  const [title, setTitle] = useState(existing?.title ?? "");
  const [slug, setSlug] = useState(existing?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(existing));
  const [excerpt, setExcerpt] = useState(existing?.excerpt ?? "");
  const [bodyText, setBodyText] = useState(blocksToText(existing?.body));
  const [cover, setCover] = useState(existing?.cover_image ?? "");
  const [categoryId, setCategoryId] = useState(existing?.category_id ?? "");
  const [authorId, setAuthorId] = useState(existing?.author_id ?? "");
  const [readMinutes, setReadMinutes] = useState(existing?.read_minutes ?? 4);
  const [seoTitle, setSeoTitle] = useState(existing?.seo_title ?? "");
  const [seoDescription, setSeoDescription] = useState(existing?.seo_description ?? "");
  const [isVoice, setIsVoice] = useState(existing?.is_voice ?? false);
  const [isHero, setIsHero] = useState(existing?.is_hero ?? false);
  const [heroPosition, setHeroPosition] = useState(existing?.hero_position ?? 1);
  const [isPick, setIsPick] = useState(existing?.is_editors_pick ?? false);
  const [busy, setBusy] = useState(false);

  const status: StoryStatus = existing?.status ?? "draft";
  const id = existing?.id;

  const buildPayload = (nextStatus?: StoryStatus) => ({
    ...(id ? { id } : {}),
    title: title.trim(),
    slug: (slugTouched ? slug : slugify(title)).trim(),
    excerpt: excerpt.trim() || null,
    bodyText,
    cover_image: cover.trim() || null,
    category_id: categoryId || null,
    author_id: authorId || null,
    read_minutes: Number(readMinutes) || 4,
    seo_title: seoTitle.trim() || null,
    seo_description: seoDescription.trim() || null,
    is_voice: isVoice,
    ...(nextStatus ? { status: nextStatus } : {}),
  });

  const persist = async (nextStatus?: StoryStatus) => {
    setBusy(true);
    try {
      const result = await save({ data: buildPayload(nextStatus) });
      if (!result.ok) {
        toast.error(result.message);
        return null;
      }
      await queryClient.invalidateQueries();
      toast.success(nextStatus ? `Saved as ${statusLabels[nextStatus]}` : "Saved");
      if (!id && result.story) {
        navigate({ to: "/admin/stories/$id/edit", params: { id: result.story.id } });
      }
      return result.story;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
      return null;
    } finally {
      setBusy(false);
    }
  };

  const transition = async (next: StoryStatus) => {
    if (!id) {
      await persist(next);
      return;
    }
    setBusy(true);
    try {
      const result = await changeStatus({ data: { id, status: next } });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      await queryClient.invalidateQueries();
      toast.success(`Status: ${statusLabels[next]}`);
    } finally {
      setBusy(false);
    }
  };

  const applyFlags = async () => {
    if (!id) {
      toast.error("Save the story first.");
      return;
    }
    setBusy(true);
    try {
      const result = await changeFlags({
        data: {
          id,
          is_hero: isHero,
          hero_position: isHero ? Number(heroPosition) : null,
          is_editors_pick: isPick,
          is_voice: isVoice,
        },
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      await queryClient.invalidateQueries();
      toast.success("Placement updated");
    } finally {
      setBusy(false);
    }
  };

  const field = "w-full border border-border bg-secondary px-4 py-3 text-sm outline-none focus:border-accent";
  const label = "text-xs font-bold tracking-[0.16em] text-muted-foreground uppercase";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <label className={label} htmlFor="title">
            Title
          </label>
          <input
            id="title"
            className={field}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
          />
        </div>
        <div className="grid gap-2">
          <label className={label} htmlFor="slug">
            Slug
          </label>
          <input
            id="slug"
            className={field}
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
          />
        </div>
        <div className="grid gap-2">
          <label className={label} htmlFor="excerpt">
            Excerpt
          </label>
          <textarea
            id="excerpt"
            rows={2}
            className={field}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <label className={label} htmlFor="body">
            Body — blank line between paragraphs, "## " for a heading, "&gt; " for a quote
          </label>
          <textarea
            id="body"
            rows={16}
            className={field}
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
          />
        </div>
      </div>

      <aside className="grid content-start gap-5 border border-border/60 bg-card/50 p-5">
        <div>
          <p className={label}>Status</p>
          <p className="mt-1 text-2xl text-accent uppercase">{statusLabels[status]}</p>
        </div>

        <div className="grid gap-2">
          <button
            disabled={busy}
            onClick={() => persist()}
            className="bg-accent px-4 py-3 text-xs font-bold tracking-[0.16em] text-accent-foreground uppercase disabled:opacity-60"
          >
            Save
          </button>
          {status === "draft" ? (
            <button
              disabled={busy}
              onClick={async () => {
                const saved = await persist();
                if (saved || id) await transition("in_review");
              }}
              className="border border-accent px-4 py-3 text-xs font-bold tracking-[0.16em] text-accent uppercase disabled:opacity-60"
            >
              Submit for review
            </button>
          ) : null}
          {me?.isEditorial ? (
            <>
              <button
                disabled={busy}
                onClick={() => transition("published")}
                className="border border-border px-4 py-3 text-xs font-bold tracking-[0.16em] uppercase hover:border-accent hover:text-accent disabled:opacity-60"
              >
                Approve &amp; publish
              </button>
              <button
                disabled={busy}
                onClick={() => transition("archived")}
                className="border border-border px-4 py-3 text-xs font-bold tracking-[0.16em] uppercase hover:border-accent hover:text-accent disabled:opacity-60"
              >
                Archive
              </button>
              {id ? (
                <button
                  disabled={busy}
                  onClick={async () => {
                    const result = await removeStory({ data: { id } });
                    if (!result.ok) {
                      toast.error(result.message);
                      return;
                    }
                    await queryClient.invalidateQueries();
                    toast.success("Story deleted");
                    navigate({ to: "/admin/stories" });
                  }}
                  className="border border-destructive/60 px-4 py-3 text-xs font-bold tracking-[0.16em] text-destructive uppercase disabled:opacity-60"
                >
                  Delete
                </button>
              ) : null}
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              Reporters cannot publish. Submitting for review sends this to an editor — the
              database rejects any publish attempt from a reporter account.
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <label className={label} htmlFor="category">
            Category
          </label>
          <select
            id="category"
            className={field}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Uncategorised</option>
            {(ref?.categories ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <label className={label} htmlFor="author">
            Author
          </label>
          <select
            id="author"
            className={field}
            value={authorId}
            onChange={(e) => setAuthorId(e.target.value)}
          >
            <option value="">Unassigned</option>
            {(ref?.authors ?? []).map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <label className={label} htmlFor="cover">
            Cover image URL
          </label>
          <input
            id="cover"
            className={field}
            value={cover}
            placeholder="/img/story-music.jpg or https://…"
            onChange={(e) => setCover(e.target.value)}
          />
          <div className="grid grid-cols-5 gap-1">
            {PRESET_IMAGES.map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => setCover(src)}
                className={`aspect-square overflow-hidden border ${
                  cover === src ? "border-accent" : "border-border/60"
                }`}
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          {cover ? (
            <img src={cover} alt="Cover preview" className="mt-1 h-28 w-full object-cover" />
          ) : null}
        </div>

        <div className="grid gap-2">
          <label className={label} htmlFor="read">
            Read minutes
          </label>
          <input
            id="read"
            type="number"
            min={1}
            max={90}
            className={field}
            value={readMinutes}
            onChange={(e) => setReadMinutes(Number(e.target.value))}
          />
        </div>

        <div className="grid gap-2 border-t border-border/60 pt-4">
          <p className={label}>Homepage placement</p>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isHero} onChange={(e) => setIsHero(e.target.checked)} />
            Hero
          </label>
          {isHero ? (
            <input
              type="number"
              min={1}
              max={8}
              aria-label="Hero position"
              className={field}
              value={heroPosition}
              onChange={(e) => setHeroPosition(Number(e.target.value))}
            />
          ) : null}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isPick} onChange={(e) => setIsPick(e.target.checked)} />
            Editor's Pick
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isVoice} onChange={(e) => setIsVoice(e.target.checked)} />
            Voices (opinion)
          </label>
          <button
            disabled={busy}
            onClick={applyFlags}
            className="border border-border px-4 py-2.5 text-xs font-bold tracking-[0.16em] uppercase hover:border-accent hover:text-accent disabled:opacity-60"
          >
            Apply placement
          </button>
        </div>

        <div className="grid gap-2 border-t border-border/60 pt-4">
          <label className={label} htmlFor="seoTitle">
            SEO title
          </label>
          <input
            id="seoTitle"
            className={field}
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
          />
          <label className={label} htmlFor="seoDesc">
            SEO description
          </label>
          <textarea
            id="seoDesc"
            rows={3}
            className={field}
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
          />
        </div>
      </aside>
    </div>
  );
}
