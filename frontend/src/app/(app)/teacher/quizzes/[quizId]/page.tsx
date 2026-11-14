"use client";

import { useQuizDetailQuery } from "@/api/queries/quizzes";
import { BackLink, PageHeader } from "@/components/Layout/AppShell";
import { Reveal } from "@/components/Motion";
import { ErrorState, PageLoader } from "@/components/States";
import { Button } from "@/components/ui/button";
import { formatDate, pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";
import { BarChart3, Check, UserPlus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

const LETTERS = ["A", "B", "C", "D"];

export default function QuizDetailPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const quiz = useQuizDetailQuery(quizId);

  if (quiz.isLoading) return <PageLoader rows={5} />;
  if (quiz.isError || !quiz.data) {
    return <ErrorState error={quiz.error} onRetry={() => quiz.refetch()} />;
  }

  const { title, description, createdAt, questions, assignedCount } = quiz.data;

  return (
    <Reveal className="mx-auto max-w-4xl">
      <BackLink href="/teacher">All quizzes</BackLink>
      <PageHeader
        title={title}
        subtitle={description || undefined}
        actions={
          <div className="flex gap-2">
            <Link href={`/teacher/quizzes/${quizId}/assign`}>
              <Button variant="pencil">
                <UserPlus className="size-4" aria-hidden /> Assign
              </Button>
            </Link>
            <Link href={`/teacher/quizzes/${quizId}/analytics`}>
              <Button variant="secondary">
                <BarChart3 className="size-4" aria-hidden /> Results
              </Button>
            </Link>
          </div>
        }
      />

      <div data-reveal className="mb-6 flex flex-wrap gap-2 text-sm">
        <span className="rounded-full bg-paper px-3 py-1 font-medium shadow-[var(--shadow-sheet)]">
          {pluralize(questions.length, "question")}
        </span>
        <span className="rounded-full bg-paper px-3 py-1 font-medium shadow-[var(--shadow-sheet)]">
          Assigned to {pluralize(assignedCount, "student")}
        </span>
        <span className="rounded-full bg-paper px-3 py-1 font-medium text-ink-soft shadow-[var(--shadow-sheet)]">
          Written {formatDate(createdAt)}
        </span>
      </div>

      <ol className="space-y-4">
        {questions.map((question, qi) => (
          <li key={question.id} data-reveal className="ruled sheet rounded-2xl py-5 pl-16 pr-5 sm:py-6 sm:pl-[4.75rem] sm:pr-7">
            <span
              aria-hidden
              className="absolute left-0 top-5 w-[3.25rem] text-center font-display text-2xl font-extrabold tabular-nums text-ink/30 max-sm:w-10 max-sm:text-xl sm:top-6"
            >
              {qi + 1}
            </span>
            <p className="font-display text-lg font-bold leading-snug sm:text-xl">
              <span className="sr-only">Question {qi + 1}: </span>
              {question.prompt}
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {question.options.map((option, oi) => (
                <li
                  key={option.id}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border-[1.5px] px-3 py-2.5 text-sm",
                    option.isCorrect ? "border-mark bg-mark-soft font-semibold" : "border-line",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-full border-[1.5px] text-xs font-bold",
                      option.isCorrect ? "border-mark bg-mark text-white" : "border-ink/30 text-ink-soft",
                    )}
                  >
                    {LETTERS[oi] ?? oi + 1}
                  </span>
                  <span className="min-w-0 flex-1 break-words">{option.text}</span>
                  {option.isCorrect && <Check className="size-4 shrink-0 text-mark" strokeWidth={3} aria-label="Correct answer" />}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </Reveal>
  );
}
