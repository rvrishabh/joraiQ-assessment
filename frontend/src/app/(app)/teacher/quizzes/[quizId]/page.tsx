"use client";

import { useQuizDetailQuery } from "@/api/queries/quizzes";
import { PageHeader } from "@/components/Layout/AppShell";
import { ErrorState, PageLoader } from "@/components/States";
import { Button } from "@/components/ui/button";
import { formatDate, pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ArrowLeft, BarChart3, Check, UserPlus } from "lucide-react";
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
    <>
      <Link href="/teacher" className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> All quizzes
      </Link>
      <PageHeader
        title={title}
        subtitle={
          description ||
          `${pluralize(questions.length, "question")} - created ${formatDate(createdAt)}`
        }
        actions={
          <div className="flex gap-2">
            <Link href={`/teacher/quizzes/${quizId}/assign`}>
              <Button variant="secondary">
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

      <p className="mb-4 text-sm text-ink-soft">
        {pluralize(questions.length, "question")} - assigned to {pluralize(assignedCount, "student")}.
        The correct answer is marked in green.
      </p>

      <ol className="space-y-4">
        {questions.map((question, qi) => (
          <li key={question.id} className="rounded-xl border border-line bg-paper p-5 sm:p-6">
            <p className="font-display text-lg font-semibold">
              {qi + 1}. {question.prompt}
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {question.options.map((option, oi) => (
                <li
                  key={option.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-3.5 py-2.5 text-sm",
                    option.isCorrect
                      ? "border-mark bg-mark-soft font-medium"
                      : "border-line bg-sheet/50",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold",
                      option.isCorrect ? "bg-mark text-white" : "bg-line text-ink-soft",
                    )}
                  >
                    {LETTERS[oi] ?? oi + 1}
                  </span>
                  <span className="min-w-0 flex-1 break-words">{option.text}</span>
                  {option.isCorrect && (
                    <Check className="size-4 shrink-0 text-mark" aria-label="Correct answer" />
                  )}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </>
  );
}
