import { ArrowRight, ArrowLeft } from "lucide-react";

export function ArrowButton({
  direction = "right",
  onClick,
  label,
  variant = "outline",
  size = "md",
}: {
  direction?: "left" | "right";
  onClick?: () => void;
  label: string;
  variant?: "outline" | "solid" | "muted";
  size?: "sm" | "md";
}) {
  const Icon = direction === "left" ? ArrowLeft : ArrowRight;
  const styles =
    variant === "solid"
      ? "bg-accent text-accent-foreground border-accent"
      : variant === "muted"
        ? "border-border text-foreground hover:border-accent hover:text-accent"
        : "border-accent text-accent hover:bg-accent hover:text-accent-foreground";
  const dim = size === "sm" ? "h-8 w-8" : "h-10 w-10";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`inline-flex ${dim} shrink-0 items-center justify-center rounded-full border transition-colors ${styles}`}
    >
      <Icon className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
    </button>
  );
}
