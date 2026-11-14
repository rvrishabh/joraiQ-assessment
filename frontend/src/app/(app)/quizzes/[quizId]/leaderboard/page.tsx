"use client";

import { useLeaderboardQuery } from "@/api/queries/leaderboard";
import { BackLink, PageHeader } from "@/components/Layout/AppShell";
import { prefersReducedMotion, Reveal } from "@/components/Motion";
import { EmptyState, ErrorState, PageLoader } from "@/components/States";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useAuth } from "@/hooks/useAuth";
import { formatPercent, initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/types";
import { useGSAP } from "@gsap/react";
import { useParams } from "next/navigation";
import gsap from "gsap";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

type Entry = LeaderboardEntry;

// Display order left to right: 2nd, 1st, 3rd.
const PODIUM_ORDER = [1, 0, 2];
const PODIUM = [
  { h: "h-40 sm:h-48", medal: "bg-ink text-white", block: "bg-pencil text-ink [&_.pd-sub]:text-ink/60" },
  { h: "h-28 sm:h-36", medal: "bg-[#d7dcea] text-ink", block: "bg-ink text-white" },
  { h: "h-20 sm:h-28", medal: "bg-[#e9b48a] text-ink", block: "bg-[#3d4a8c] text-white" },
];

function Podium({ top }: { top: Entry[] }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const tl = gsap.timeline({ delay: 0.25 });
      // Third place rises first, the winner last.
      [2, 1, 0].forEach((place) => {
        const col = root.current?.querySelector(`[data-place="${place}"]`);
        if (!col) return;
        tl.from(col.querySelector(".pd-block"), { scaleY: 0, transformOrigin: "bottom", duration: 0.55, ease: "power3.out" }, place === 2 ? 0 : "-=0.3");
        tl.from(col.querySelector(".pd-person"), { y: 30, opacity: 0, duration: 0.45, ease: "back.out(2)" }, "-=0.2");
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="mb-6 grid grid-cols-3 items-end gap-2 sm:gap-4" aria-label="Top three">
      {PODIUM_ORDER.map((place) => {
        const e = top[place];
        if (!e) return <div key={place} />;
        const style = PODIUM[place]!;
        return (
          <div key={place} data-place={place} className="flex flex-col items-center">
            <div className="pd-person mb-3 flex flex-col items-center text-center">
              <span
                className={cn(
                  "relative grid size-14 place-items-center rounded-full border-[3px] font-display text-lg font-extrabold sm:size-16",
                  e.isCurrentUser ? "border-pencil bg-pencil-soft" : "border-paper bg-paper",
                  "shadow-[var(--shadow-sheet)]",
                )}
              >
                {initials(e.displayName)}
                <span className={cn("absolute -bottom-1.5 -right-1.5 grid size-7 place-items-center rounded-full text-xs font-extrabold shadow", style.medal)}>
                  {e.rank}
                </span>
              </span>
              <p className="mt-2.5 max-w-[9rem] truncate text-sm font-semibold">
                {e.displayName}
                {e.isCurrentUser && <span className="text-ink-soft"> (you)</span>}
              </p>
            </div>
            <div className={cn("pd-block flex w-full flex-col items-center justify-start rounded-t-2xl pt-4", style.h, style.block)}>
              <span className="font-display text-2xl font-extrabold tabular-nums sm:text-3xl">{formatPercent(e.accuracy)}</span>
              <span className="pd-sub text-xs text-white/60 tabular-nums">
                {e.correctCount}/{e.totalQuestions}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function LeaderboardPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const { user } = useAuth();
  const board = useLeaderboardQuery(quizId);
  const backTo = user?.role === "TEACHER" ? "/teacher" : "/student";
  const entries = board.data?.entries ?? [];
  const rest = entries.slice(3);

  return (
    <Reveal className="mx-auto max-w-3xl" deps={[board.data]}>
      <BackLink href={backTo}>Back</BackLink>
      <PageHeader
        title={board.data?.title ?? "Leaderboard"}
        subtitle="Ranked by accuracy. Students with the same accuracy share a rank."
      />

      {board.isLoading && <PageLoader />}
      {board.isError && <ErrorState error={board.error} onRetry={() => board.refetch()} />}

      {board.data && (
        <>
          {user?.role === "STUDENT" && (
            <div
              data-reveal
              className={cn(
                "mb-8 flex items-center gap-4 rounded-2xl border-[1.5px] px-5 py-4",
                board.data.me ? "border-ink bg-pencil-soft shadow-[0_4px_0_0_var(--color-ink)]" : "sheet",
              )}
            >
              {board.data.me ? (
                <>
                  <span className="font-display text-4xl font-extrabold tabular-nums">#{board.data.me.rank}</span>
                  <p className="text-ink-soft">
                    Your place out of <span className="font-semibold text-ink">{board.data.participants}</span> students
                  </p>
                </>
              ) : (
                <p className="text-sm text-ink-soft">You are not on the board yet. Submit the quiz to get a rank.</p>
              )}
            </div>
          )}

          {entries.length === 0 ? (
            <EmptyState title="No submissions yet" body="The leaderboard fills in as students finish the quiz." />
          ) : (
            <>
              <div data-reveal>
                <Podium top={entries.slice(0, 3)} />
              </div>
              {rest.length > 0 && (
                <ol className="sheet overflow-hidden rounded-2xl">
                  {rest.map((e, i) => (
                    <li
                      key={i}
                      data-reveal
                      aria-current={e.isCurrentUser ? "true" : undefined}
                      className={cn(
                        "grid grid-cols-[2.5rem_2.5rem_1fr_auto] items-center gap-3 border-b border-line px-4 py-3.5 last:border-b-0 sm:gap-4 sm:px-5",
                        e.isCurrentUser && "bg-pencil-soft",
                      )}
                    >
                      <span className="font-display text-xl font-extrabold tabular-nums text-ink/35">{e.rank}</span>
                      <span className="grid size-10 place-items-center rounded-full bg-sheet font-display text-sm font-bold">
                        {initials(e.displayName)}
                      </span>
                      <div className="min-w-0 space-y-1.5">
                        <p className="truncate font-semibold">
                          {e.displayName}
                          {e.isCurrentUser && (
                            <span className="ml-2 rounded-full bg-ink px-2 py-0.5 text-[11px] font-semibold text-white">You</span>
                          )}
                        </p>
                        <ProgressBar value={e.accuracy} tone="auto" label={`${e.displayName} accuracy`} className="h-1.5" />
                      </div>
                      <div className="text-right">
                        <p className="font-display text-lg font-extrabold tabular-nums">{formatPercent(e.accuracy)}</p>
                        <p className="text-xs tabular-nums text-ink-soft">
                          {e.correctCount}/{e.totalQuestions}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </>
          )}
        </>
      )}
    </Reveal>
  );
}
