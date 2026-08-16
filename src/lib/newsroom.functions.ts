import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type TagDTO = { id: string; name: string; slug: string };

export const listTags = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("tags")
      .select("id,name,slug")
      .order("name");
    if (error) throw new Error(error.message);
    return { tags: (data ?? []) as TagDTO[] };
  });

export const createTag = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { name: string }) =>
    z.object({ name: z.string().trim().min(2).max(60) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);
    const { data: existing } = await context.supabase
      .from("tags")
      .select("id,name,slug")
      .eq("slug", slug)
      .maybeSingle();
    if (existing) return { ok: true as const, tag: existing as TagDTO };

    const { data: row, error } = await context.supabase
      .from("tags")
      .insert({ name: data.name, slug })
      .select("id,name,slug")
      .maybeSingle();
    if (error || !row) return { ok: false as const, message: error?.message ?? "Could not create tag." };
    return { ok: true as const, tag: row as TagDTO };
  });

export type StaffMember = {
  user_id: string;
  email: string | null;
  joined_at: string;
  roles: string[];
  author_id: string | null;
  author_name: string | null;
  author_slug: string | null;
};

/** Admin-only: the database function itself rejects non-admin callers. */
export const listStaff = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("admin_list_staff");
    if (error) return { ok: false as const, message: error.message, staff: [] as StaffMember[] };
    return { ok: true as const, staff: (data ?? []) as StaffMember[], message: null };
  });

const roleEnum = z.enum(["admin", "editor", "reporter"]);

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userId: string; role: "admin" | "editor" | "reporter" }) =>
    z.object({ userId: z.string().uuid(), role: roleEnum }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("admin_set_user_role", {
      _user_id: data.userId,
      _role: data.role,
    });
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const };
  });

export const removeUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userId: string; role: "admin" | "editor" | "reporter" }) =>
    z.object({ userId: z.string().uuid(), role: roleEnum }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("admin_remove_user_role", {
      _user_id: data.userId,
      _role: data.role,
    });
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const };
  });
