import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CARD_SELECT, FULL_SELECT } from "./story-types";
import type { StoryCardDTO, StoryFullDTO } from "./story-types";

export const getHomepage = createServerFn({ method: "GET" }).handler(async () => {
  const { createPublicClient } = await import("./supabase-public.server");
  const supabase = createPublicClient();

  const [storiesRes, categoriesRes, trendingRes] = await Promise.all([
    supabase
      .from("stories")
      .select(CARD_SELECT)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(60),
    supabase.from("categories").select("name,slug,accent_color").order("sort_order"),
    supabase
      .from("stories")
      .select(CARD_SELECT)
      .eq("status", "published")
      .order("view_count", { ascending: false })
      .limit(5),
  ]);

  const stories = (storiesRes.data ?? []) as unknown as StoryCardDTO[];
  const trending = (trendingRes.data ?? []) as unknown as StoryCardDTO[];

  return {
    stories,
    trending,
    categories: categoriesRes.data ?? [],
    error: storiesRes.error?.message ?? null,
  };
});

export const getStoryBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => z.object({ slug: z.string().min(1).max(120) }).parse(data))
  .handler(async ({ data }) => {
    const { createPublicClient } = await import("./supabase-public.server");
    const supabase = createPublicClient();
    const { data: story } = await supabase
      .from("stories")
      .select(FULL_SELECT)
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();

    if (!story) return { story: null, related: [] as StoryCardDTO[] };

    const full = story as unknown as StoryFullDTO;
    const { data: related } = await supabase
      .from("stories")
      .select(CARD_SELECT)
      .eq("status", "published")
      .neq("slug", data.slug)
      .limit(3);

    return { story: full, related: (related ?? []) as unknown as StoryCardDTO[] };
  });

export const recordStoryView = createServerFn({ method: "POST" })
  .inputValidator((data: { storyId: string }) => z.object({ storyId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { createPublicClient } = await import("./supabase-public.server");
    const supabase = createPublicClient();
    await supabase.from("story_views").insert({ story_id: data.storyId });
    return { ok: true };
  });

export const subscribeToNewsletter = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; source?: string }) =>
    z
      .object({ email: z.string().trim().email().max(255), source: z.string().max(40).optional() })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { createPublicClient } = await import("./supabase-public.server");
    const supabase = createPublicClient();
    const { error } = await supabase
      .from("subscribers")
      .insert({ email: data.email.toLowerCase(), source: data.source ?? "homepage" });
    if (error) {
      if (error.code === "23505" || error.code === "23514" || error.code === "23000") {
        return { ok: false, message: "You're already on the list." };
      }
      if (error.code === "23505" || error.message.includes("duplicate")) {
        return { ok: false, message: "You're already on the list." };
      }
      return { ok: false, message: "Something went wrong. Try again." };
    }
    return { ok: true, message: "You're in. Welcome to the frequency." };
  });
