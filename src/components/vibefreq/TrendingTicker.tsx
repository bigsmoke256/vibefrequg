import { trending } from "@/data/stories";
import { Waveform } from "./Waveform";

export function TrendingTicker() {
  return (
    <div className="border-t border-border/60 bg-background">
      <div className="mx-auto flex max-w-[1500px] items-stretch">
        <div className="flex shrink-0 items-center gap-2 bg-accent px-5 py-4 text-accent-foreground">
          <Waveform className="text-accent-foreground" />
          <span className="text-sm font-bold tracking-[0.18em] uppercase">
            Trending
          </span>
        </div>
        <ul className="no-scrollbar flex flex-1 items-center gap-8 overflow-x-auto border-y border-r border-border/60 px-5">
          {trending.map((s, i) => (
            <li key={s.id} className="flex shrink-0 items-center gap-3 py-4">
              <span className="text-lg text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-sm whitespace-nowrap text-foreground/90">
                {s.title}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
