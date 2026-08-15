import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { StoryCardDTO } from "@/lib/story-types";
import { Waveform, BrandMark } from "./Waveform";

export function Hero({ stories }: { stories: StoryCardDTO[] }) {
  const [index, setIndex] = useState(0);
  const list = (stories ?? []).slice(0, 4);
  const story = list[index] ?? list[0];

  if (!story) {
    return (
      <section className="border-b border-border/60 px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex items-center gap-3">
            <Waveform />
            <span className="text-xs font-bold tracking-[0.24em] text-accent uppercase">
              VibeFreq
            </span>
          </div>
          <h1 className="mt-4 text-6xl leading-[0.92] uppercase sm:text-7xl">
            Music. Tech. Culture. Hustle<span className="text-accent">.</span>
          </h1>
          <p className="mt-6 max-w-md text-muted-foreground">
            No stories published yet. Publish one from the newsroom to fill this hero.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden border-b border-border/60 bg-background">
      <div className="absolute inset-0">
        <div className="absolute inset-y-0 right-0 w-full md:w-[62%]">
          <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
            <BrandMark className="h-[80%] w-[80%] text-accent/25" />
          </div>
          <img
            src={story.cover_image ?? "/img/hero-portrait.jpg"}
            alt={story.title}
            width={1408}
            height={1008}
            className="duotone-soft relative h-full w-full object-cover object-[60%_28%] opacity-90 mix-blend-lighten"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-background/10 md:via-background/40" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </div>
      </div>

      <div className="relative mx-auto max-w-[1500px] px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
        <div className="max-w-xl">
          <div className="flex items-center gap-3">
            <Waveform />
            <span className="text-xs font-bold tracking-[0.24em] text-accent uppercase">
              {story.category?.name ?? "Culture"}
            </span>
          </div>
          <h1 className="mt-4 text-5xl leading-[0.92] uppercase sm:text-6xl lg:text-7xl">
            {story.title}
            <span className="text-accent">.</span>
          </h1>
          {story.excerpt ? (
            <p className="mt-6 max-w-md text-base text-muted-foreground">{story.excerpt}</p>
          ) : null}
          <p className="mt-4 text-sm font-bold tracking-[0.28em] text-accent uppercase">
            Music. Tech. Culture. Hustle.
          </p>
          <Link
            to="/story/$slug"
            params={{ slug: story.slug }}
            className="mt-7 inline-flex items-center gap-3 bg-accent px-6 py-3.5 text-sm font-bold tracking-[0.16em] text-accent-foreground uppercase transition-opacity hover:opacity-90"
          >
            Read the story <ArrowRight className="h-4 w-4" />
          </Link>

          <div className="mt-9 flex items-center gap-3 text-xs font-semibold tracking-[0.2em]">
            {list.map((s, i) => (
              <span key={s.id} className="flex items-center gap-3">
                <button
                  onClick={() => setIndex(i)}
                  aria-label={`Show hero story ${i + 1}: ${s.title}`}
                  aria-current={i === index}
                  className={
                    i === index ? "text-accent" : "text-muted-foreground hover:text-foreground"
                  }
                >
                  {String(i + 1).padStart(2, "0")}
                </button>
                {i < list.length - 1 ? <span className="h-px w-8 bg-border" /> : null}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
