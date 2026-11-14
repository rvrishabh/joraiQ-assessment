"use client";

import { useQuizResultQuery } from "@/api/queries/attempts";
import { ErrorState, PageLoader } from "@/components/States";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/axios";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Check, Trophy, X } from "lucide-react";
import { ScoreRing } from "../../../_components/ScoreRing";

export default function ResultPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const result = useQuizResultQuery(quizId);

  if (result.isLoading) return <PageLoader rows={3} />;
  if (result.error instanceof ApiError && result.error.status === 404) {
    return (
      <div className="mx-auto max-w-md space-y-4 py-16 text-center">
        <h1 className="text-3xl font-bold">No result yet</h1>
        <p className="text-ink-soft">You have not submitted this quiz.</p>
        <Link href={`/student/quizzes/${quizId}/attempt`}>
          <Button>Start quiz</Button>
        </Link>
      </div>
    );
  }
  if (result.isError || !result.data) {
    return <ErrorState error={result.error} onRetry={() => result.refetch()} />;
  }

  const r = result.data;
  const stats = [
    { label: "Total questions", value: r.totalQuestions },
    { label: "Correct", value: r.correctCount },
    { label: "Incorrect", value: r.incorrectCount },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/student" className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> Back to my quizzes
      </Link>

      <section className="flex flex-col items-center gap-6 rounded-2xl border border-line bg-paper p-8 sm:flex-row sm:gap-10">
        <ScoreRing accuracy={r.accuracy} />
        <div className="flex-1 text-center sm:text-left">
          <Badge tone="done">Completed</Badge>
          <h1 className="mt-2 text-3xl font-bold">
            You got {r.correctCount} of {r.totalQuestions} right
          </h1>
          <p className="mt-1 text-sm text-ink-soft">Submitted {formatDate(r.submittedAt)}</p>
          <dl className="mt-5 grid grid-cols-3 gap-3 text-left">
            {stats.map((s) => (
              <div key={s.label} className="rounded-lg bg-sheet px-3 py-2.5">
                <dd className="font-display text-2xl font-bold tabular-nums">{s.value}</dd>
                <dt className="text-xs text-ink-soft">{s.label}</dt>
              </div>
            ))}
          </dl>
          <Link href={`/quizzes/${quizId}/leaderboard`} className="mt-5 inline-block">
            <Button>
              <Trophy className="size-4" aria-hidden /> See the leaderboard
            </Button>
          </Link>
        </div>
      </section>

      <h2 className="mb-3 mt-10 text-xl font-semibold">Your answers</h2>
      <ol className="space-y-3">
        {r.review.map((q, i) => (
          <li key={q.questionId} className="rounded-xl border border-line bg-paper p-5">
            <p className="flex items-start gap-3 font-medium">
              <span
                className={cn(
                  "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-white",
                  q.isCorrect ? "bg-mark" : "bg-redpen",
                )}
              >
                {q.isCorrect ? <Check className="size-3.5" aria-label="Correct" /> : <X className="size-3.5" aria-label="Incorrect" />}
              </span>
              <span>
                {i + 1}. {q.prompt}
              </span>
            </p>
            <ul className="mt-3 space-y-1.5 pl-9 text-sm">
              {q.options.map((o) => {
                const isCorrect = o.id === q.correctOptionId;
                const isPicked = o.id === q.selectedOptionId;
                return (
                  <li
                    key={o.id}
                    className={cn(
                      "rounded-md px-3 py-1.5",
                      isCorrect && "bg-mark-soft text-mark",
                      isPicked && !isCorrect && "bg-redpen-soft text-redpen",
                    )}
                  >
                    {o.text}
                    {isCorrect && " - correct answer"}
                    {isPicked && !isCorrect && " - your answer"}
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
