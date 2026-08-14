export type StoryStatus =
  | "draft"
  | "in_review"
  | "scheduled"
  | "published"
  | "archived";

export type StoryBlock = { type: "paragraph" | "heading" | "quote"; text: string };

export type StoryCardDTO = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image: string | null;
  read_minutes: number;
  view_count: number;
  is_hero: boolean;
  hero_position: number | null;
  is_editors_pick: boolean;
  is_voice: boolean;
  published_at: string | null;
  category: { name: string; slug: string } | null;
  author: { name: string; slug: string; avatar: string | null } | null;
};

export type StoryFullDTO = StoryCardDTO & {
  body: StoryBlock[];
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
  status: StoryStatus;
};

export const CARD_SELECT =
  "id,slug,title,excerpt,cover_image,read_minutes,view_count,is_hero,hero_position,is_editors_pick,is_voice,published_at,category:categories(name,slug),author:authors(name,slug,avatar)";

export const FULL_SELECT = `${CARD_SELECT},body,seo_title,seo_description,og_image,status`;

export const statusLabels: Record<StoryStatus, string> = {
  draft: "Draft",
  in_review: "In Review",
  scheduled: "Scheduled",
  published: "Published",
  archived: "Archived",
};

export function formatDate(value: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function textToBlocks(text: string): StoryBlock[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) =>
      p.startsWith("## ")
        ? { type: "heading" as const, text: p.slice(3).trim() }
        : p.startsWith("> ")
          ? { type: "quote" as const, text: p.slice(2).trim() }
          : { type: "paragraph" as const, text: p },
    );
}

export function blocksToText(blocks: StoryBlock[] | null | undefined) {
  if (!blocks?.length) return "";
  return blocks
    .map((b) =>
      b.type === "heading" ? `## ${b.text}` : b.type === "quote" ? `> ${b.text}` : b.text,
    )
    .join("\n\n");
}
