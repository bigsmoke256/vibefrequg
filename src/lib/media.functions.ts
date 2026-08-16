import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const MEDIA_BUCKET = "story-images";
export const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export const MAX_BYTES = 10 * 1024 * 1024;

export type MediaAsset = {
  id: string;
  storage_path: string;
  url: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  alt_text: string | null;
  caption: string | null;
  credit: string | null;
  uploaded_by: string | null;
  created_at: string;
};

export function mediaUrlFor(storagePath: string) {
  return `/api/public/media/${storagePath}`;
}

export const listMedia = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { q?: string } | undefined) =>
    z.object({ q: z.string().trim().max(120).optional() }).parse(data ?? {}),
  )
  .handler(async ({ data, context }) => {
    let query = context.supabase
      .from("media_assets")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(120);
    if (data.q) {
      const like = `%${data.q}%`;
      query = query.or(
        `file_name.ilike.${like},alt_text.ilike.${like},credit.ilike.${like},caption.ilike.${like}`,
      );
    }
    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return { assets: (rows ?? []) as MediaAsset[] };
  });

export const registerMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        storage_path: z.string().min(3).max(400),
        file_name: z.string().min(1).max(240),
        mime_type: z.enum(ALLOWED_MIME),
        size_bytes: z.number().int().min(1).max(MAX_BYTES),
        alt_text: z.string().trim().max(300).optional().nullable(),
        caption: z.string().trim().max(400).optional().nullable(),
        credit: z.string().trim().max(200).optional().nullable(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("media_assets")
      .insert({
        storage_path: data.storage_path,
        url: mediaUrlFor(data.storage_path),
        file_name: data.file_name,
        mime_type: data.mime_type,
        size_bytes: data.size_bytes,
        alt_text: data.alt_text ?? null,
        caption: data.caption ?? null,
        credit: data.credit ?? null,
        uploaded_by: context.userId,
      })
      .select("*")
      .maybeSingle();
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const, asset: row as MediaAsset };
  });

export const updateMediaMeta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        alt_text: z.string().trim().max(300).optional().nullable(),
        caption: z.string().trim().max(400).optional().nullable(),
        credit: z.string().trim().max(200).optional().nullable(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("media_assets")
      .update({
        alt_text: data.alt_text ?? null,
        caption: data.caption ?? null,
        credit: data.credit ?? null,
      })
      .eq("id", data.id)
      .select("id")
      .maybeSingle();
    if (error) return { ok: false as const, message: error.message };
    if (!row) return { ok: false as const, message: "Blocked by access policy." };
    return { ok: true as const };
  });

export const deleteMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: asset } = await context.supabase
      .from("media_assets")
      .select("storage_path")
      .eq("id", data.id)
      .maybeSingle();
    const { error, count } = await context.supabase
      .from("media_assets")
      .delete({ count: "exact" })
      .eq("id", data.id);
    if (error) return { ok: false as const, message: error.message };
    if (!count) return { ok: false as const, message: "Blocked by access policy." };
    if (asset?.storage_path) {
      await context.supabase.storage.from(MEDIA_BUCKET).remove([asset.storage_path]);
    }
    return { ok: true as const };
  });
