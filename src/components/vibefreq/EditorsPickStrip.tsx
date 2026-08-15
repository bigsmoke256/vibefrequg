import { Link } from "@tanstack/react-router";
import type { StoryCardDTO } from "@/lib/story-types";
import { formatDate } from "@/lib/story-types";
import { SectionLabel } from "./SectionLabel";
import { StoryCard } from "./StoryCard";

export function EditorsPickStrip({
  picks,
  trending,
}: {
  picks: StoryCardDTO[];
  trending: StoryCardDTO[];
}) {
  if (!picks?.length && !trending?.length) return null;

  return (
    <section className="mx-auto max-w-[1500px] px-4 py-12 sm:px-6">
      <SectionLabel>Editor's Pick</SectionLabel>
      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-4 sm:grid-cols-3">
          {(picks ?? []).slice(0, 3).map((s) => (
            <StoryCard key={s.id} story={s} aspect="aspect-[4/3]" showMeta={false} />
          ))}
        </div>

        <aside className="border border-border/60 bg-card/60 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg tracking-wide uppercase">Trending</h3>
            <a
              href="#latest"
              className="text-[11px] font-bold tracking-[0.16em] text-accent uppercase"
            >
              View all
            </a>
          </div>
          <ul className="mt-4 grid gap-4">
            {(trending ?? []).slice(0, 3).map((s, i) => (
              <li key={s.id}>
                <Link to="/story/$slug" params={{ slug: s.slug }} className="flex items-center gap-3">
                  <span className="text-xl text-accent">0{i + 1}</span>
                  <img
                    src={s.cover_image ?? "/img/story-culture.jpg"}
                    alt={s.title}
                    loading="lazy"
                    width={1024}
                    height={768}
                    className="duotone h-12 w-16 shrink-0 object-cover"
                  />
                  <div>
                    <p className="line-clamp-2 text-sm font-semibold">{s.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDate(s.published_at)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
