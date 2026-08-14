import { Clock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { StoryCardDTO } from "@/lib/story-types";
import { formatDate } from "@/lib/story-types";
import { CategoryTag } from "./CategoryTag";

export function StoryCard({
  story,
  className = "",
  aspect = "aspect-[3/4]",
  showMeta = true,
}: {
  story: StoryCardDTO;
  className?: string;
  aspect?: string;
  showMeta?: boolean;
}) {
  return (
    <article
      className={`group relative overflow-hidden border border-border/60 bg-card ${aspect} ${className}`}
    >
      <img
        src={story.cover_image ?? "/img/story-culture.jpg"}
        alt={story.title}
        loading="lazy"
        width={1024}
        height={768}
        className="duotone absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />
      <div className="scrim absolute inset-0" />
      <div className="absolute top-4 left-4">
        <CategoryTag category={story.category?.name ?? "VibeFreq"} />
      </div>
      <Link
        to="/story/$slug"
        params={{ slug: story.slug }}
        className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4"
        aria-label={`Read ${story.title}`}
      >
        <div>
          <h3 className="line-clamp-2 text-xl leading-tight uppercase">{story.title}</h3>
          {showMeta ? (
            <>
              <p className="mt-2 text-xs text-foreground/80">
                By {story.author?.name ?? "VibeFreq Desk"}
              </p>
              <p className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{formatDate(story.published_at)}</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {story.read_minutes} min read
                </span>
              </p>
            </>
          ) : null}
        </div>
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border transition-colors group-hover:border-accent group-hover:text-accent">
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </Link>
    </article>
  );
}
