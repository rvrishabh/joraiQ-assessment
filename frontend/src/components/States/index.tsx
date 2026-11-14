import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/axios";
import { AlertTriangle, Inbox } from "lucide-react";
import type { ReactNode } from "react";

export function PageLoader({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
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
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line bg-paper/60 px-6 py-14 text-center">
      <Inbox className="size-8 text-ink-soft" aria-hidden />
      <div className="space-y-1">
        <p className="font-display text-lg font-semibold">{title}</p>
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
      className="flex flex-col items-center gap-3 rounded-xl border border-redpen/30 bg-redpen-soft px-6 py-12 text-center"
    >
      <AlertTriangle className="size-8 text-redpen" aria-hidden />
      <p className="max-w-md text-sm">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
