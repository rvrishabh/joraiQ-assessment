import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/axios";
import type { ReactNode } from "react";

export function PageLoader({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading">
      <Skeleton className="mb-6 h-10 w-2/5" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  );
}

/** A blank answer column: nothing marked yet. */
function BlankColumn() {
  return (
    <div className="relative" aria-hidden>
      <div className="floaty sheet flex -rotate-3 gap-2 rounded-xl p-3 [--r:-3deg]">
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex flex-col gap-2">
            {["A", "B", "C"].map((l) => (
              <span
                key={l}
                className="grid size-6 place-items-center rounded-full border border-ink/25 text-[9px] font-semibold text-ink/35"
              >
                {l}
              </span>
            ))}
          </div>
        ))}
      </div>
      <span className="hand absolute -right-7 -top-4 rotate-12 text-2xl text-redpen">?</span>
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl border-2 border-dashed border-ink/15 bg-paper/70 px-6 py-14 text-center">
      <BlankColumn />
      <div className="space-y-1.5">
        <p className="font-display text-xl font-bold">{title}</p>
        <p className="mx-auto max-w-sm text-sm text-ink-soft">{body}</p>
      </div>
      {action}
    </div>
  );
}

export function ErrorState({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry?: () => void;
}) {
  const message =
    error instanceof ApiError ? error.message : "Something went wrong while loading this page.";
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-4 rounded-2xl border border-redpen/25 bg-redpen-soft/70 px-6 py-12 text-center"
    >
      <span className="hand grid size-14 place-items-center rounded-full border-[3px] border-redpen text-4xl text-redpen" aria-hidden>
        !
      </span>
      <p className="max-w-md text-sm">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
