const colorMap: Record<string, string> = {
  Music: "text-cat-music",
  Culture: "text-cat-culture",
  Style: "text-cat-style",
  Tech: "text-cat-tech",
  Entertainment: "text-cat-entertainment",
  Hustle: "text-cat-hustle",
};

export function CategoryTag({
  category,
  className = "",
}: {
  category: string;
  className?: string;
}) {
  return (
    <span
      className={`text-[11px] font-semibold tracking-[0.18em] uppercase ${colorMap[category] ?? "text-accent"} ${className}`}
    >
      {category}
    </span>
  );
}
