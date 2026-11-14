"use client";

import { Button } from "@/components/ui/button";
import { formatDate, pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { QuizSummary } from "@/types";
import Link from "next/link";
import { BarChart3, Trophy, UserPlus } from "lucide-react";

const MAX_BUBBLES = 14;

/** One bubble per assigned student: filled once they have submitted. */
function CompletionBubbles({ done, total }: { done: number; total: number }) {
  const shown = Math.min(total, MAX_BUBBLES);
  const filled = total ? Math.round((done / total) * shown) : 0;
  return (
    <div className="flex flex-wrap items-center gap-1" aria-hidden>
      {Array.from({ length: shown }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "size-3.5 rounded-full border-[1.5px] transition-colors",
            i < filled ? "border-mark bg-mark" : "border-ink/25",
          )}
          style={{ transitionDelay: `${i * 40}ms` }}
        />
      ))}
      {total > MAX_BUBBLES && <span className="ml-1 text-xs text-ink-soft">+{total - MAX_BUBBLES}</span>}
    </div>
  );
}

export function QuizTable({ quizzes }: { quizzes: QuizSummary[] }) {
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {quizzes.map((quiz) => {
        const allDone = quiz.assignedCount > 0 && quiz.completedCount === quiz.assignedCount;
        return (
          <li
            key={quiz.id}
            data-reveal
            className="sheet group relative flex flex-col rounded-2xl p-5 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] sm:p-6"
          >
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/teacher/quizzes/${quiz.id}`}
                  className="block truncate font-display text-xl font-bold leading-snug decoration-pencil decoration-[3px] underline-offset-4 after:absolute after:inset-0 after:content-[''] hover:underline"
                >
                  {quiz.title}
                </Link>
                <p className="mt-0.5 text-sm text-ink-soft">
                  {pluralize(quiz.questionCount, "question")}, written {formatDate(quiz.createdAt)}
                </p>
              </div>
              {allDone && (
                <span className="hand shrink-0 rotate-6 text-2xl text-mark" aria-label="Everyone finished">
                  all in!
                </span>
              )}
            </div>

            <div className="mt-5 space-y-2">
              {quiz.assignedCount === 0 ? (
                <p className="text-sm text-ink-soft">Not handed out yet</p>
              ) : (
                <>
                  <p className="text-sm">
                    <span className="font-display text-lg font-extrabold tabular-nums">{quiz.completedCount}</span>
                    <span className="text-ink-soft"> of {quiz.assignedCount} submitted</span>
                  </p>
                  <CompletionBubbles done={quiz.completedCount} total={quiz.assignedCount} />
                </>
              )}
            </div>

            {/* Buttons sit above the card-wide link */}
            <div className="relative z-10 mt-6 flex flex-wrap gap-2 border-t border-line pt-4">
              <Link href={`/teacher/quizzes/${quiz.id}/assign`}>
                <Button variant={quiz.assignedCount === 0 ? "pencil" : "secondary"} size="sm">
                  <UserPlus className="size-4" aria-hidden /> Assign
                </Button>
              </Link>
              <Link href={`/teacher/quizzes/${quiz.id}/analytics`}>
                <Button variant="secondary" size="sm">
                  <BarChart3 className="size-4" aria-hidden /> Results
                </Button>
              </Link>
              <Link href={`/quizzes/${quiz.id}/leaderboard`} className="ml-auto">
                <Button variant="ghost" size="sm" aria-label={`${quiz.title} leaderboard`}>
                  <Trophy className="size-4" aria-hidden />
                </Button>
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
