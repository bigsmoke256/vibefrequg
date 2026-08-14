import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { voices } from "@/data/stories";
import { SectionLabel } from "./SectionLabel";
import { ArrowButton } from "./ArrowButton";

export function Voices() {
  const [page, setPage] = useState(0);
  const pages = 3;

  return (
    <div className="flex h-full flex-col border border-border/60 bg-card/50 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionLabel sub="Real opinions. Real people. Real talk.">
          Voices
        </SectionLabel>
        <a
          href="#voices"
          className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.16em] text-accent uppercase"
        >
          View all voices <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="mt-6 grid flex-1 gap-5 sm:grid-cols-3">
        {voices.map((v) => (
          <article key={v.id} className="flex items-start gap-4">
            <img
              src={v.avatar}
              alt={v.author}
              loading="lazy"
              width={512}
              height={640}
              className="duotone h-16 w-16 shrink-0 rounded-full object-cover"
            />
            <div>
              <h3 className="text-base leading-snug font-semibold">{v.title}</h3>
              <p className="mt-2 text-xs text-foreground/80">By {v.author}</p>
              <p className="text-xs text-muted-foreground">{v.date}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <ArrowButton
          direction="left"
          label="Previous voices"
          variant="muted"
          size="sm"
          onClick={() => setPage((p) => (p - 1 + pages) % pages)}
        />
        <div className="flex items-center gap-3 text-xs font-bold tracking-[0.2em]">
          {Array.from({ length: pages }).map((_, i) => (
            <span key={i} className="flex items-center gap-3">
              <button
                onClick={() => setPage(i)}
                aria-label={`Go to voices page ${i + 1}`}
                className={
                  i === page ? "text-accent" : "text-muted-foreground hover:text-foreground"
                }
              >
                0{i + 1}
              </button>
              {i < pages - 1 ? <span className="h-px w-6 bg-border" /> : null}
            </span>
          ))}
        </div>
        <ArrowButton
          direction="right"
          label="Next voices"
          variant="muted"
          size="sm"
          onClick={() => setPage((p) => (p + 1) % pages)}
        />
      </div>
    </div>
  );
}
