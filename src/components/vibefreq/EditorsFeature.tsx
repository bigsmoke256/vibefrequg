import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { StoryCardDTO } from "@/lib/story-types";
import { formatDate } from "@/lib/story-types";
import { SectionLabel } from "./SectionLabel";
import { CategoryTag } from "./CategoryTag";

export function EditorsFeature({ story }: { story: StoryCardDTO | null }) {
  return (
    <div className="flex h-full flex-col border border-border/60 bg-card/50 p-5 sm:p-6">
      <SectionLabel>Editor's Pick</SectionLabel>
      {story ? (
        <div className="mt-6 grid flex-1 gap-0 md:grid-cols-[65%_1fr]">
          <img
            src={story.cover_image ?? "/img/editors-feature.jpg"}
            alt={story.title}
            loading="lazy"
            width={1408}
            height={912}
            className="duotone h-64 w-full object-cover md:h-full"
          />
          <div className="flex flex-col justify-center gap-3 bg-card p-5">
            <CategoryTag category={story.category?.name ?? "VibeFreq"} />
            <h3 className="text-3xl leading-[1.05] uppercase">{story.title}</h3>
            <p className="text-xs text-foreground/80">
              By {story.author?.name ?? "VibeFreq Desk"}
            </p>
            <p className="text-xs text-muted-foreground">{formatDate(story.published_at)}</p>
            <Link
              to="/story/$slug"
              params={{ slug: story.slug }}
              className="mt-3 inline-flex w-fit items-center gap-2 bg-accent px-4 py-3 text-xs font-bold tracking-[0.16em] text-accent-foreground uppercase transition-opacity hover:opacity-90"
            >
              Read feature <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <p className="mt-6 flex-1 text-sm text-muted-foreground">
          No editor's pick selected yet.
        </p>
      )}
    </div>
  );
}
