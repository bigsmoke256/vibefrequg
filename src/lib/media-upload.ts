import { supabase } from "@/integrations/supabase/client";
import { registerMedia, ALLOWED_MIME, MAX_BYTES, MEDIA_BUCKET } from "./media.functions";
import type { MediaAsset } from "./media.functions";

export function validateImage(file: File): string | null {
  if (!(ALLOWED_MIME as readonly string[]).includes(file.type)) {
    return "Images only — use JPG, PNG, WEBP or AVIF.";
  }
  if (file.size > MAX_BYTES) {
    return `That file is ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum is 10MB.`;
  }
  return null;
}

function safeName(name: string) {
  const dot = name.lastIndexOf(".");
  const base = (dot > 0 ? name.slice(0, dot) : name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const ext = dot > 0 ? name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "jpg";
  return `${base || "image"}.${ext || "jpg"}`;
}

/** Uploads to Cloud storage and registers the asset in the media library. */
export async function uploadImage(
  file: File,
  meta?: { alt_text?: string | null; caption?: string | null; credit?: string | null },
): Promise<{ ok: true; asset: MediaAsset } | { ok: false; message: string }> {
  const invalid = validateImage(file);
  if (invalid) return { ok: false, message: invalid };

  const { data: userRes } = await supabase.auth.getUser();
  const uid = userRes.user?.id;
  if (!uid) return { ok: false, message: "Your session expired — sign in again." };

  const path = `${uid}/${Date.now()}-${safeName(file.name)}`;
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) return { ok: false, message: error.message };

  const result = await registerMedia({
    data: {
      storage_path: path,
      file_name: file.name.slice(0, 240),
      mime_type: file.type as (typeof ALLOWED_MIME)[number],
      size_bytes: file.size,
      alt_text: meta?.alt_text ?? null,
      caption: meta?.caption ?? null,
      credit: meta?.credit ?? null,
    },
  });
  if (!result.ok) return { ok: false, message: result.message };
  return { ok: true, asset: result.asset };
}
