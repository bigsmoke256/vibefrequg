export const CATEGORY_NAMES = [
  "Music",
  "Tech",
  "Style",
  "Culture",
  "Entertainment",
  "Hustle",
] as const;

export function categorySlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
