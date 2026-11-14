import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

const tones = {
  neutral: { wrap: "bg-ink/[0.06] text-ink-soft", dot: "border-ink-soft/60 bg-transparent" },
  done: { wrap: "bg-mark-soft text-mark", dot: "border-mark bg-mark" },
  pending: { wrap: "bg-pencil-soft text-[#7a5800]", dot: "border-pencil-deep bg-transparent" },
  bad: { wrap: "bg-redpen-soft text-redpen", dot: "border-redpen bg-redpen" },
} as const;

/** Status pill with a tiny answer bubble: filled when done, empty when not. */
export function Badge({
  tone = "neutral",
  className,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof tones }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full py-0.5 pl-1.5 pr-2.5 text-xs font-semibold",
        tones[tone].wrap,
        className,
      )}
      {...props}
    >
      <span className={cn("size-2.5 rounded-full border-[1.5px]", tones[tone].dot)} aria-hidden />
      {children}
    </span>
  );
}
