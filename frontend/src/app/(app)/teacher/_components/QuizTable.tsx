"use client";

import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { formatDate, pluralize } from "@/lib/format";
import type { QuizSummary } from "@/types";
import Link from "next/link";
import { BarChart3, ListChecks, Trophy, UserPlus } from "lucide-react";

export function QuizTable({ quizzes }: { quizzes: QuizSummary[] }) {
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-paper">
      {quizzes.map((quiz) => {
        const pct = quiz.assignedCount ? (quiz.completedCount / quiz.assignedCount) * 100 : 0;
        return (
          <li
            key={quiz.id}
            className="grid gap-4 p-5 md:grid-cols-[1.4fr_1fr_auto] md:items-center"
          >
            <div className="min-w-0">
              <Link
                href={`/teacher/quizzes/${quiz.id}`}
                className="block truncate font-display text-lg font-semibold underline-offset-4 hover:underline"
              >
                {quiz.title}
              </Link>
              <p className="mt-0.5 text-sm text-ink-soft">
                {pluralize(quiz.questionCount, "question")} - created {formatDate(quiz.createdAt)}
              </p>
            </div>

            <div className="space-y-1.5">
              <p className="text-sm text-ink-soft">
                {quiz.assignedCount === 0
                  ? "Not assigned yet"
                  : `${quiz.completedCount} of ${quiz.assignedCount} completed`}
              </p>
              <ProgressBar value={pct} label={`${quiz.title} completion`} />
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href={`/teacher/quizzes/${quiz.id}`}>
                <Button variant="secondary" size="sm">
                  <ListChecks className="size-4" aria-hidden /> Questions
                </Button>
              </Link>
              <Link href={`/teacher/quizzes/${quiz.id}/assign`}>
                <Button variant="secondary" size="sm">
                  <UserPlus className="size-4" aria-hidden /> Assign
                </Button>
              </Link>
              <Link href={`/teacher/quizzes/${quiz.id}/analytics`}>
                <Button variant="secondary" size="sm">
                  <BarChart3 className="size-4" aria-hidden /> Results
                </Button>
              </Link>
              <Link href={`/quizzes/${quiz.id}/leaderboard`}>
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
