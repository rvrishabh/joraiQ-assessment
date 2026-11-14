"use client";

import { useQuizResultQuery } from "@/api/queries/attempts";
import { BackLink } from "@/components/Layout/AppShell";
import { CountUp, PenCross, PenTick, Reveal } from "@/components/Motion";
import { ErrorState, PageLoader } from "@/components/States";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/axios";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Check, Trophy } from "lucide-react";
import { GradedScore } from "../../../_components/GradedScore";

function verdict(accuracy: number) {
  if (accuracy === 100) return "Full marks.";
  if (accuracy >= 80) return "Excellent work.";
  if (accuracy >= 60) return "Good effort.";
  if (accuracy >= 40) return "Getting there.";
  return "Worth another look.";
}

export default function ResultPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const result = useQuizResultQuery(quizId);

  if (result.isLoading) return <PageLoader rows={3} />;
  if (result.error instanceof ApiError && result.error.status === 404) {
    return (
      <div className="mx-auto max-w-md space-y-4 py-16 text-center">
        <h1 className="text-4xl font-extrabold">No result yet</h1>
        <p className="text-ink-soft">You have not submitted this quiz.</p>
        <Link href={`/student/quizzes/${quizId}/attempt`}>
          <Button variant="pencil">Start quiz</Button>
        </Link>
      </div>
    );
  }
  if (result.isError || !result.data) {
    return <ErrorState error={result.error} onRetry={() => result.refetch()} />;
  }

  const r = result.data;

  return (
    <Reveal className="mx-auto max-w-3xl">
      <BackLink href="/student">Back to my quizzes</BackLink>

      <section data-reveal className="sheet relative overflow-hidden rounded-3xl">
        <div className="flex flex-col items-center gap-6 p-7 sm:flex-row sm:gap-8 sm:p-9">
          <GradedScore correct={r.correctCount} total={r.totalQuestions} accuracy={r.accuracy} />
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-4xl font-extrabold leading-[1.05] sm:text-5xl">{verdict(r.accuracy)}</h1>
            <p className="mt-2 text-ink-soft">
              You got {r.correctCount} of {r.totalQuestions} right. Submitted {formatDate(r.submittedAt)}.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              <Link href={`/quizzes/${quizId}/leaderboard`}>
                <Button variant="pencil" size="lg">
                  <Trophy className="size-4" aria-hidden /> See the leaderboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <dl className="grid grid-cols-3 border-t border-line bg-sheet/60">
          <Figure label="Accuracy" value={r.accuracy} suffix="%" />
          <Figure label="Correct" value={r.correctCount} tone="text-mark" />
          <Figure label="Incorrect" value={r.incorrectCount} tone="text-redpen" />
        </dl>
      </section>

      <h2 data-reveal className="mb-4 mt-12 text-2xl font-extrabold">
        Your answers
      </h2>
      <ol className="space-y-4">
        {r.review.map((q, i) => (
          <li key={q.questionId} data-reveal className="ruled sheet rounded-2xl py-5 pl-16 pr-5 sm:pl-[4.75rem] sm:pr-7">
            <span
              className={cn(
                "absolute left-0 top-4 grid w-[3.25rem] place-items-center max-sm:w-10",
                q.isCorrect ? "text-mark" : "text-redpen",
              )}
            >
              {q.isCorrect ? (
                <PenTick className="size-8" delay={0.4 + i * 0.12} />
              ) : (
                <PenCross className="size-7" delay={0.4 + i * 0.12} />
              )}
              <span className="sr-only">{q.isCorrect ? "Correct" : "Incorrect"}</span>
            </span>
            <p className="font-display text-lg font-bold leading-snug">
              <span className="mr-1.5 text-ink/35 tabular-nums">{i + 1}.</span>
              {q.prompt}
            </p>
            <ul className="mt-3.5 grid gap-2 sm:grid-cols-2">
              {q.options.map((o) => {
                const isCorrect = o.id === q.correctOptionId;
                const isPicked = o.id === q.selectedOptionId;
                return (
                  <li
                    key={o.id}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl border-[1.5px] px-3 py-2 text-sm",
                      isCorrect && "border-mark bg-mark-soft font-semibold text-[#0a5c40]",
                      isPicked && !isCorrect && "border-redpen/60 bg-redpen-soft text-redpen",
                      !isCorrect && !isPicked && "border-line text-ink-soft",
                    )}
                  >
                    <span className={cn("min-w-0 flex-1", isPicked && !isCorrect && "line-through decoration-2")}>
                      {o.text}
                    </span>
                    {isCorrect && (
                      <span className="flex shrink-0 items-center gap-1 text-xs">
                        <Check className="size-3.5" aria-hidden />
                        {isPicked ? "Your answer" : "Correct answer"}
                      </span>
                    )}
                    {isPicked && !isCorrect && <span className="shrink-0 text-xs font-semibold">Your answer</span>}
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>
    </Reveal>
  );
}

function Figure({ label, value, suffix, tone }: { label: string; value: number; suffix?: string; tone?: string }) {
  return (
    <div className="px-5 py-4 text-center sm:px-7 sm:text-left [&:not(:first-child)]:border-l [&:not(:first-child)]:border-line">
      <dd className={cn("font-display text-3xl font-extrabold", tone)}>
        <CountUp value={Math.round(value)} suffix={suffix} />
      </dd>
      <dt className="text-xs font-medium text-ink-soft">{label}</dt>
    </div>
  );
}
