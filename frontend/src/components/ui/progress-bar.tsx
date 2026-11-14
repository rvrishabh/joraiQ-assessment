import { cn } from "@/lib/utils";

const fills = {
  mark: "bg-mark",
  ink: "bg-ink",
  pencil: "bg-pencil",
  auto: "",
} as const;

export function ProgressBar({
  value,
  tone = "mark",
  className,
  label,
}: {
  value: number;
  tone?: keyof typeof fills;
  className?: string;
  label: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const autoFill = pct >= 75 ? "bg-mark" : pct >= 40 ? "bg-pencil" : "bg-redpen";
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-ink/[0.07]", className)}
    >
      <div
        className={cn(
          "h-full origin-left animate-grow-x rounded-full transition-[width] duration-500 ease-out",
          tone === "auto" ? autoFill : fills[tone],
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
