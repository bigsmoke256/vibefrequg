import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { CARD_SELECT, FULL_SELECT } from "./story-types";
import type { StoryCardDTO, StoryFullDTO, StoryStatus } from "./story-types";

const statusEnum = z.enum(["draft", "in_review", "scheduled", "published", "archived"]);

export const getMyAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [rolesRes, authorRes, userRes] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("authors").select("id,name,slug,avatar").eq("user_id", userId).maybeSingle(),
      supabase.auth.getUser(),
    ]);
    const roles = (rolesRes.data ?? []).map((r) => r.role as string);
    return {
      userId,
      email: userRes.data.user?.email ?? null,
      roles,
      isAdmin: roles.includes("admin"),
      isEditorial: roles.includes("admin") || roles.includes("editor"),
      isReporter: roles.includes("reporter"),
      author: authorRes.data ?? null,
    };
  });

export const listAdminStories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { status?: StoryStatus | "all"; q?: string; categoryId?: string; authorId?: string }) =>
    z
      .object({
        status: statusEnum.or(z.literal("all")).optional(),
        q: z.string().max(120).optional(),
        categoryId: z.string().uuid().optional(),
        authorId: z.string().uuid().optional(),
      })
      .parse(data ?? {}),
  )
  .handler(async ({ data, context }) => {
    let query = context.supabase
      .from("stories")
      .select(`${CARD_SELECT},status,created_at,updated_at,created_by,scheduled_for,corrected_at`)
      .order("updated_at", { ascending: false })
      .limit(200);

    if (data.status && data.status !== "all") query = query.eq("status", data.status);
    if (data.categoryId) query = query.eq("category_id", data.categoryId);
    if (data.authorId) query = query.eq("author_id", data.authorId);
    if (data.q) query = query.ilike("title", `%${data.q}%`);

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return {
      stories: (rows ?? []) as unknown as (StoryCardDTO & {
        status: StoryStatus;
        scheduled_for: string | null;
        corrected_at: string | null;
      })[],
    };
  });

export const getAdminStory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: story, error } = await context.supabase
      .from("stories")
      .select(`${FULL_SELECT},category_id,author_id,created_by`)
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { story: (story ?? null) as unknown as (StoryFullDTO & { category_id: string | null; author_id: string | null; created_by: string | null }) | null };
  });

export const listRefData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [categories, authors] = await Promise.all([
      context.supabase.from("categories").select("id,name,slug").order("sort_order"),
      context.supabase.from("authors").select("id,name,slug").order("name"),
    ]);
    return { categories: categories.data ?? [], authors: authors.data ?? [] };
  });

const storyInput = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(3).max(200),
  slug: z.string().trim().min(3).max(120).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().trim().max(400).optional().nullable(),
  bodyText: z.string().max(60000).optional().nullable(),
  cover_image: z.string().trim().max(600).optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  author_id: z.string().uuid().optional().nullable(),
  read_minutes: z.number().int().min(1).max(90).optional(),
  seo_title: z.string().trim().max(200).optional().nullable(),
  seo_description: z.string().trim().max(400).optional().nullable(),
  og_image: z.string().trim().max(600).optional().nullable(),
  is_voice: z.boolean().optional(),
  status: statusEnum.optional(),
  scheduled_for: z.string().datetime({ offset: true }).nullable().optional(),
  correction_note: z.string().trim().max(500).nullable().optional(),
  tagIds: z.array(z.string().uuid()).max(20).optional(),
});

export const saveStory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => storyInput.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { textToBlocks } = await import("./story-types");

    const payload = {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt ?? null,
      body: textToBlocks(data.bodyText ?? ""),
      cover_image: data.cover_image ?? null,
      category_id: data.category_id ?? null,
      author_id: data.author_id ?? null,
      read_minutes: data.read_minutes ?? 4,
      seo_title: data.seo_title ?? null,
      seo_description: data.seo_description ?? null,
      og_image: data.og_image ?? null,
      is_voice: data.is_voice ?? false,
      ...(data.scheduled_for !== undefined ? { scheduled_for: data.scheduled_for } : {}),
    };

    const syncTags = async (storyId: string) => {
      if (!data.tagIds) return;
      await supabase.from("story_tags").delete().eq("story_id", storyId);
      if (data.tagIds.length) {
        await supabase
          .from("story_tags")
          .insert(data.tagIds.map((tag_id) => ({ story_id: storyId, tag_id })));
      }
    };

    if (data.id) {
      const update: Record<string, unknown> = data.status
        ? { ...payload, status: data.status }
        : { ...payload };

      const { data: current } = await supabase
        .from("stories")
        .select("status")
        .eq("id", data.id)
        .maybeSingle();

      const note = data.correction_note?.trim();
      if (note) {
        update["correction_note"] = note;
        if (current?.status === "published") update["corrected_at"] = new Date().toISOString();
      } else if (data.correction_note === null) {
        update["correction_note"] = null;
      }

      const { data: row, error } = await supabase
        .from("stories")
        .update(update)

        .eq("id", data.id)
        .select("id,slug,status")
        .maybeSingle();
      if (error) return { ok: false as const, message: error.message };
      if (!row) return { ok: false as const, message: "Not allowed to edit this story." };
      await syncTags(row.id);
      return { ok: true as const, story: row };
    }

    const { data: author } = await supabase
      .from("authors")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    const { data: row, error } = await supabase
      .from("stories")
      .insert({
        ...payload,
        author_id: payload.author_id ?? author?.id ?? null,
        created_by: userId,
        status: data.status ?? "draft",
      })
      .select("id,slug,status")
      .maybeSingle();
    if (error) return { ok: false as const, message: error.message };
    if (row) await syncTags(row.id);
    return { ok: true as const, story: row! };
  });

export const setStoryStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status: StoryStatus; scheduled_for?: string | null }) =>
    z
      .object({
        id: z.string().uuid(),
        status: statusEnum,
        scheduled_for: z.string().datetime({ offset: true }).nullable().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("stories")
      .update({
        status: data.status,
        ...(data.scheduled_for !== undefined ? { scheduled_for: data.scheduled_for } : {}),
      })
      .eq("id", data.id)
      .select("id,status,slug")
      .maybeSingle();
    if (error) return { ok: false as const, message: error.message };
    if (!row) return { ok: false as const, message: "Blocked by access policy: you can't set this status." };
    return { ok: true as const, story: row };
  });

export const setStoryFlags = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: { id: string; is_hero?: boolean; hero_position?: number | null; is_editors_pick?: boolean; is_voice?: boolean }) =>
      z
        .object({
          id: z.string().uuid(),
          is_hero: z.boolean().optional(),
          hero_position: z.number().int().min(1).max(8).nullable().optional(),
          is_editors_pick: z.boolean().optional(),
          is_voice: z.boolean().optional(),
        })
        .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { id } = data;
    const flags: {
      is_hero?: boolean;
      hero_position?: number | null;
      is_editors_pick?: boolean;
      is_voice?: boolean;
    } = {};
    if (data.is_hero !== undefined) flags.is_hero = data.is_hero;
    if (data.hero_position !== undefined) flags.hero_position = data.hero_position;
    if (data.is_editors_pick !== undefined) flags.is_editors_pick = data.is_editors_pick;
    if (data.is_voice !== undefined) flags.is_voice = data.is_voice;
    const { data: row, error } = await context.supabase
      .from("stories")
      .update(flags)

      .eq("id", id)
      .select("id,is_hero,hero_position,is_editors_pick,is_voice")
      .maybeSingle();
    if (error) return { ok: false as const, message: error.message };
    if (!row) return { ok: false as const, message: "Blocked by access policy." };
    return { ok: true as const, story: row };
  });

export const deleteStory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error, count } = await context.supabase
      .from("stories")
      .delete({ count: "exact" })
      .eq("id", data.id);
    if (error) return { ok: false as const, message: error.message };
    if (!count) return { ok: false as const, message: "Blocked by access policy." };
    return { ok: true as const };
  });

export const getDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const statuses: StoryStatus[] = ["draft", "in_review", "scheduled", "published", "archived"];
    const counts: Record<string, number> = {};
    await Promise.all(
      statuses.map(async (s) => {
        const { count } = await context.supabase
          .from("stories")
          .select("id", { count: "exact", head: true })
          .eq("status", s);
        counts[s] = count ?? 0;
      }),
    );
    const { data: recent } = await context.supabase
      .from("stories")
      .select("id,slug,title,status,updated_at")
      .order("updated_at", { ascending: false })
      .limit(8);
    const { count: subscribers } = await context.supabase
      .from("subscribers")
      .select("id", { count: "exact", head: true });
    return { counts, recent: recent ?? [], subscribers: subscribers ?? 0 };
  });

export const getStoryTags = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("story_tags")
      .select("tag_id")
      .eq("story_id", data.id);
    if (error) throw new Error(error.message);
    return { tagIds: (rows ?? []).map((r) => r.tag_id) };
  });
