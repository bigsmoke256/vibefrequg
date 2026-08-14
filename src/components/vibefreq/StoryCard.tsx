import { Clock } from "lucide-react";
import type { Story } from "@/data/stories";
import { CategoryTag } from "./CategoryTag";
import { ArrowButton } from "./ArrowButton";

export function StoryCard({
  story,
  className = "",
  aspect = "aspect-[3/4]",
  showMeta = true,
}: {
  story: Story;
  className?: string;
  aspect?: string;
  showMeta?: boolean;
}) {
  return (
    <article
      className={`group relative overflow-hidden border border-border/60 bg-card ${aspect} ${className}`}
    >
      <img
        src={story.image}
        alt={story.title}
        loading="lazy"
        width={1024}
        height={768}
        className="duotone absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />
      <div className="scrim absolute inset-0" />
      <div className="absolute top-4 left-4">
        <CategoryTag category={story.category} />
      </div>
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
        <div>
          <h3 className="line-clamp-2 text-xl leading-tight uppercase">
            {story.title}
          </h3>
          {showMeta ? (
            <>
              <p className="mt-2 text-xs text-foreground/80">By {story.author}</p>
              <p className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{story.date}</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {story.readTime}
                </span>
              </p>
            </>
          ) : null}
        </div>
        <ArrowButton
          label={`Read ${story.title}`}
          variant="muted"
          size="sm"
        />
      </div>
    </article>
  );
}
