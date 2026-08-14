import { useRef, useState } from "react";
import { categories, stories, type Category } from "@/data/stories";
import { SectionLabel } from "./SectionLabel";
import { StoryCard } from "./StoryCard";
import { ArrowButton } from "./ArrowButton";

export function LatestStories() {
  const [active, setActive] = useState<"All" | Category>("All");
  const trackRef = useRef<HTMLDivElement>(null);

  const list =
    active === "All" ? stories : stories.filter((s) => s.category === active);

  const scrollBy = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.6), behavior: "smooth" });
  };

  return (
    <section id="latest" className="mx-auto max-w-[1500px] px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex flex-wrap items-center gap-6">
          <SectionLabel>Latest Stories</SectionLabel>
          <div className="flex flex-wrap items-center gap-5 text-xs font-bold tracking-[0.16em] uppercase">
            {(["All", ...categories] as const).map((c) => (
              <button
                key={c}
                onClick={() => setActive(c as "All" | Category)}
                className={
                  active === c
                    ? "border-b-2 border-accent pb-1 text-accent"
                    : "pb-1 text-muted-foreground transition-colors hover:text-foreground"
                }
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ArrowButton direction="left" label="Previous stories" variant="muted" onClick={() => scrollBy(-1)} />
          <ArrowButton direction="right" label="Next stories" onClick={() => scrollBy(1)} />
        </div>
      </div>

      <div
        ref={trackRef}
        className="no-scrollbar mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
      >
        {list.map((s) => (
          <StoryCard
            key={s.id}
            story={s}
            aspect="aspect-[3/4]"
            className="w-[78vw] shrink-0 snap-start sm:w-[46vw] lg:w-[calc((100%-4rem)/5)]"
          />
        ))}
      </div>
    </section>
  );
}
