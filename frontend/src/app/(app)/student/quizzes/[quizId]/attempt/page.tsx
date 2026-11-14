"use client";

import { useSubmitAttemptMutation } from "@/api/mutations/attempts";
import { useAttemptSheetQuery } from "@/api/queries/attempts";
import { Redirect } from "@/components/Redirect";
import { ErrorState, PageLoader } from "@/components/States";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ApiError } from "@/lib/axios";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

const LETTERS = ["A", "B", "C", "D"];

interface AttemptForm {
  answers: Record<string, string>;
}

export default function AttemptPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const router = useRouter();
  const sheet = useAttemptSheetQuery(quizId);
  const submit = useSubmitAttemptMutation(quizId);
  const { setValue, control, handleSubmit } = useForm<AttemptForm>({
    defaultValues: { answers: {} },
  });
  const answers = useWatch({ control, name: "answers" });

  if (sheet.isLoading) return <PageLoader rows={5} />;

  // Already submitted: the result is the right place to be.
  if (sheet.error instanceof ApiError && sheet.error.status === 409) {
    return <Redirect to={`/student/quizzes/${quizId}/result`} />;
  }
  if (sheet.isError || !sheet.data) {
    return <ErrorState error={sheet.error} onRetry={() => sheet.refetch()} />;
  }

  const quiz = sheet.data;
  const answered = quiz.questions.filter((q) => answers?.[q.id]).length;
  const total = quiz.questions.length;

  const onSubmit = async (values: AttemptForm) => {
    await submit.mutateAsync({
      answers: quiz.questions.map((q) => ({
        questionId: q.id,
        optionId: values.answers[q.id]!,
      })),
    });
    router.replace(`/student/quizzes/${quizId}/result`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-3xl">
      <Link href="/student" className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> Back to my quizzes
      </Link>
      <h1 className="text-3xl font-bold sm:text-4xl">{quiz.title}</h1>
      {quiz.description && <p className="mt-1.5 text-ink-soft">{quiz.description}</p>}

      <ol className="mt-8 space-y-5">
        {quiz.questions.map((q, qi) => (
          <li key={q.id}>
            <fieldset className="rounded-xl border border-line bg-paper p-5 sm:p-6">
              <legend className="sr-only">Question {qi + 1}</legend>
              <p className="mb-4 flex gap-3 font-display text-lg font-semibold">
                <span className="text-ink-soft tabular-nums">{qi + 1}.</span>
                <span>{q.prompt}</span>
              </p>
              <div className="space-y-2.5" role="radiogroup" aria-label={q.prompt}>
                {q.options.map((o, oi) => {
                  const selected = answers?.[q.id] === o.id;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() =>
                        setValue(`answers.${q.id}`, o.id, { shouldDirty: true })
                      }
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                        selected ? "border-ink bg-pencil/20" : "border-line hover:border-ink/40",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-8 shrink-0 place-items-center rounded-full border text-xs font-semibold transition-colors",
                          selected ? "border-ink bg-ink text-white" : "border-ink/40 text-ink-soft",
                        )}
                      >
                        {LETTERS[oi]}
                      </span>
                      <span>{o.text}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </li>
        ))}
      </ol>

      <div className="sticky bottom-0 -mx-4 mt-8 border-t border-line bg-sheet/95 px-4 py-4 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:px-5">
        <div className="flex items-center gap-4">
          <div className="flex-1 space-y-1.5">
            <p className="text-sm text-ink-soft">
              {answered} of {total} answered
            </p>
            <ProgressBar value={(answered / total) * 100} tone="ink" label="Answered questions" />
          </div>
          <Button type="submit" size="lg" disabled={answered < total} loading={submit.isPending}>
            Submit answers
          </Button>
        </div>
        {answered < total && (
          <p className="mt-2 text-xs text-ink-soft">Answer every question to submit. You can submit only once.</p>
        )}
      </div>
    </form>
  );
}
