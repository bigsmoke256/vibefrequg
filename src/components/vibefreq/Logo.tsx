import wordmark from "@/assets/vibefreq-wordmark.png.asset.json";

export function Logo({ className = "h-11" }: { className?: string }) {
  return (
    <img
      src={wordmark.url}
      alt="VibeFreq — Culture. Music. Hustle."
      className={`w-auto ${className}`}
    />
  );
}
