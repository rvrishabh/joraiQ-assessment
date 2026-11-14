"use client";

import { useLeaderboardQuery } from "@/api/queries/leaderboard";
import { PageHeader } from "@/components/Layout/AppShell";
import { EmptyState, ErrorState, PageLoader } from "@/components/States";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useAuth } from "@/hooks/useAuth";
import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import gsap from "gsap";
import { ArrowLeft } from "lucide-react";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

export default function LeaderboardPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const { user } = useAuth();
  const board = useLeaderboardQuery(quizId);
  const list = useRef<HTMLOListElement>(null);
  const backTo = user?.role === "TEACHER" ? "/teacher" : "/student";

  useGSAP(
    () => {
      if (!board.data?.entries.length) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.from(".lb-row", { opacity: 0, x: -14, duration: 0.35, stagger: 0.05, ease: "power2.out" });
    },
    { scope: list, dependencies: [board.data?.entries.length] },
  );

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={backTo} className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> Back
      </Link>
      <PageHeader
        title={board.data ? `${board.data.title}: leaderboard` : "Leaderboard"}
        subtitle="Ranked by accuracy. Students with the same accuracy share a rank."
      />

      {board.isLoading && <PageLoader />}
      {board.isError && <ErrorState error={board.error} onRetry={() => board.refetch()} />}

      {board.data && (
        <>
          {user?.role === "STUDENT" && (
            <div
              className={cn(
                "mb-5 rounded-xl border px-5 py-4",
                board.data.me ? "border-pencil bg-pencil/20" : "border-line bg-paper",
              )}
            >
              {board.data.me ? (
                <p className="font-display text-xl font-semibold">
                  You are ranked {board.data.me.rank} of {board.data.participants}
                </p>
              ) : (
                <p className="text-sm text-ink-soft">
                  You are not on the board yet. Submit the quiz to get a rank.
                </p>
              )}
            </div>
          )}

          {board.data.entries.length === 0 ? (
            <EmptyState
              title="No submissions yet"
              body="The leaderboard fills in as students finish the quiz."
            />
          ) : (
            <ol ref={list} className="overflow-hidden rounded-xl border border-line bg-paper">
              {board.data.entries.map((e, i) => (
                <li
                  key={i}
                  aria-current={e.isCurrentUser ? "true" : undefined}
                  className={cn(
                    "lb-row grid grid-cols-[3rem_1fr_auto] items-center gap-4 border-b border-line px-5 py-4 last:border-b-0",
                    e.isCurrentUser && "bg-pencil/25",
                  )}
                >
                  <span className="font-display text-3xl font-bold tabular-nums text-ink-soft">{e.rank}</span>
                  <div className="min-w-0 space-y-1.5">
                    <p className="truncate font-medium">
                      {e.displayName}
                      {e.isCurrentUser && (
                        <span className="ml-2 rounded-full bg-ink px-2 py-0.5 text-xs font-medium text-white">You</span>
                      )}
                    </p>
                    <ProgressBar value={e.accuracy} label={`${e.displayName} accuracy`} />
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl font-bold tabular-nums">{formatPercent(e.accuracy)}</p>
                    <p className="text-xs text-ink-soft tabular-nums">
                      {e.correctCount} / {e.totalQuestions} correct
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </div>
  );
}
