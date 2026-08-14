import { ArrowRight } from "lucide-react";
import heroPortrait from "@/assets/hero-portrait.jpg";
import { Waveform, BrandMark } from "./Waveform";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/60 bg-background">
      <div className="absolute inset-0">
        <div className="absolute inset-y-0 right-0 w-full md:w-[62%]">
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center"
          >
            <BrandMark className="h-[80%] w-[80%] text-accent/25" />
          </div>
          <img
            src={heroPortrait}
            alt="Editorial portrait of an African creative in sunglasses and gold jewellery"
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
              Culture
            </span>
          </div>
          <h1 className="mt-4 text-6xl leading-[0.92] uppercase sm:text-7xl lg:text-8xl">
            A new wave
            <br /> of African
            <br /> creativity
            <span className="text-accent">.</span>
          </h1>
          <p className="mt-6 max-w-md text-base text-muted-foreground">
            From the streets to the world stage, a new generation of African
            creators is redefining culture, influence and what's possible.
          </p>
          <p className="mt-4 text-sm font-bold tracking-[0.28em] text-accent uppercase">
            Music. Tech. Culture. Hustle.
          </p>
          <a
            href="#latest"
            className="mt-7 inline-flex items-center gap-3 bg-accent px-6 py-3.5 text-sm font-bold tracking-[0.16em] text-accent-foreground uppercase transition-opacity hover:opacity-90"
          >
            Read the story <ArrowRight className="h-4 w-4" />
          </a>

          <div className="mt-9 flex items-center gap-3 text-xs font-semibold tracking-[0.2em]">
            {["01", "02", "03", "04"].map((n, i) => (
              <span key={n} className="flex items-center gap-3">
                <span className={i === 0 ? "text-accent" : "text-muted-foreground"}>
                  {n}
                </span>
                {i < 3 ? <span className="h-px w-8 bg-border" /> : null}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
