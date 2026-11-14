"use client";

import { Button } from "@/components/ui/button";
import { formatDate, formatPercent, pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MyAssignment } from "@/types";
import Link from "next/link";
import { Play, Trophy } from "lucide-react";

/**
 * Each assignment is an exam ticket: a stub with the question count, a
 * perforated tear line, and the body. Finished tickets carry the score in
 * red pen.
 */
function Ticket({ a }: { a: MyAssignment }) {
  const done = a.status === "COMPLETED";
  return (
    <li
      data-reveal
      className={cn(
        "group relative flex overflow-hidden rounded-2xl transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]",
        "sheet",
      )}
    >
      <div
        className={cn(
          "flex w-20 shrink-0 flex-col items-center justify-center gap-0.5 sm:w-24",
          done ? "bg-mark-soft text-mark" : "bg-pencil-soft text-[#6b4d00]",
        )}
      >
        <span className="font-display text-3xl font-extrabold tabular-nums leading-none">{a.questionCount}</span>
        <span className="text-[11px] font-semibold">{a.questionCount === 1 ? "question" : "questions"}</span>
      </div>
      <div className="perforated w-2 shrink-0" aria-hidden />

      <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg font-bold leading-snug">{a.title}</p>
            <p className="mt-0.5 truncate text-sm text-ink-soft">
              {a.teacherName}, {formatDate(a.assignedAt)}
            </p>
          </div>
          {done && (
            <span className="hand -mt-1 shrink-0 -rotate-6 text-3xl text-redpen" aria-label={`Score ${a.correctCount} of ${a.questionCount}`}>
              {a.correctCount}/{a.questionCount}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center gap-2">
          {done ? (
            <>
              <Link href={`/student/quizzes/${a.quizId}/result`}>
                <Button variant="secondary" size="sm">View result</Button>
              </Link>
              <span className="text-sm font-medium tabular-nums text-ink-soft">{formatPercent(a.accuracy)} accuracy</span>
            </>
          ) : (
            <Link href={`/student/quizzes/${a.quizId}/attempt`}>
              <Button variant="pencil" size="sm">
                <Play className="size-3.5 fill-current" aria-hidden /> Start quiz
              </Button>
            </Link>
          )}
          <Link href={`/quizzes/${a.quizId}/leaderboard`} className="ml-auto">
            <Button variant="ghost" size="sm" aria-label={`${a.title} leaderboard`}>
              <Trophy className="size-4" aria-hidden />
            </Button>
          </Link>
        </div>
      </div>
    </li>
  );
}

export function AssignmentList({ items }: { items: MyAssignment[] }) {
  const todo = items.filter((a) => a.status !== "COMPLETED");
  const done = items.filter((a) => a.status === "COMPLETED");
  return (
    <div className="space-y-10">
      {todo.length > 0 && (
        <section aria-labelledby="todo-h">
          <h2 id="todo-h" data-reveal className="mb-4 flex items-baseline gap-2 text-xl font-bold">
            To do <span className="text-sm font-medium text-ink-soft">{pluralize(todo.length, "quiz", "quizzes")}</span>
          </h2>
          <ul className="grid gap-4 md:grid-cols-2">
            {todo.map((a) => (
              <Ticket key={a.assignmentId} a={a} />
            ))}
          </ul>
        </section>
      )}
      {done.length > 0 && (
        <section aria-labelledby="done-h">
          <h2 id="done-h" data-reveal className="mb-4 flex items-baseline gap-2 text-xl font-bold">
            Finished <span className="text-sm font-medium text-ink-soft">{pluralize(done.length, "quiz", "quizzes")}</span>
          </h2>
          <ul className="grid gap-4 md:grid-cols-2">
            {done.map((a) => (
              <Ticket key={a.assignmentId} a={a} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
