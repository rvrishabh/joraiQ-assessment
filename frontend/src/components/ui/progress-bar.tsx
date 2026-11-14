import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  tone = "mark",
  className,
  label,
}: {
  value: number;
  tone?: "mark" | "ink";
  className?: string;
  label: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-ink/8", className)}
    >
      <div
        className={cn("h-full rounded-full", tone === "mark" ? "bg-mark" : "bg-ink")}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
