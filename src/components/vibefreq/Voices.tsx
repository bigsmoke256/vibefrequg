import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { StoryCardDTO } from "@/lib/story-types";
import { formatDate } from "@/lib/story-types";
import { SectionLabel } from "./SectionLabel";
import { ArrowButton } from "./ArrowButton";

const PER_PAGE = 3;

export function Voices({ voices }: { voices: StoryCardDTO[] }) {
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(voices.length / PER_PAGE));
  const current = voices.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  return (
    <div className="flex h-full flex-col border border-border/60 bg-card/50 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionLabel sub="Real opinions. Real people. Real talk.">Voices</SectionLabel>
        <a
          href="#latest"
          className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.16em] text-accent uppercase"
        >
          View all voices <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>

      {current.length ? (
        <div className="mt-6 grid flex-1 gap-5 sm:grid-cols-3">
          {current.map((v) => (
            <article key={v.id} className="flex items-start gap-4">
              <img
                src={v.author?.avatar ?? v.cover_image ?? "/img/voice-1.jpg"}
                alt={v.author?.name ?? v.title}
                loading="lazy"
                width={512}
                height={640}
                className="duotone h-16 w-16 shrink-0 rounded-full object-cover"
              />
              <div>
                <Link
                  to="/story/$slug"
                  params={{ slug: v.slug }}
                  className="text-base leading-snug font-semibold hover:text-accent"
                >
                  {v.title}
                </Link>
                <p className="mt-2 text-xs text-foreground/80">
                  By {v.author?.name ?? "VibeFreq Desk"}
                </p>
                <p className="text-xs text-muted-foreground">{formatDate(v.published_at)}</p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-6 flex-1 text-sm text-muted-foreground">No opinion pieces yet.</p>
      )}

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
