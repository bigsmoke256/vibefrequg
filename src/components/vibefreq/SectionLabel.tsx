import type { ReactNode } from "react";
import { Waveform } from "./Waveform";

export function SectionLabel({
  children,
  sub,
}: {
  children: ReactNode;
  sub?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Waveform />
      <h2 className="text-2xl leading-none tracking-wide uppercase sm:text-3xl">
        {children}
      </h2>
      {sub ? (
        <span className="text-sm text-muted-foreground">{sub}</span>
      ) : null}
    </div>
  );
}
