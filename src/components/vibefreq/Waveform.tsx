export function Waveform({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 24"
      aria-hidden="true"
      className={`h-4 w-11 text-accent ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M0 12h5l3-9 4 20 4-16 3 11 3-6 3 8 4-14 3 12 3-5 3 7 3-9 3 5h8" />
    </svg>
  );
}

export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 90" aria-hidden="true" className={className} fill="none">
      <path d="M2 4h26l18 52L64 4h26L54 88H36L2 4z" fill="currentColor" opacity="0.9" />
      <path d="M56 4h62l-9 22H74l-3 9h30l-9 22H62l-6-53z" fill="currentColor" opacity="0.55" />
      <path
        d="M30 62h8l4-16 6 30 5-24 4 14 4-8 4 10 5-18 4 16 4-6 4 8h18"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
