"use client";

import { useSubmitAttemptMutation } from "@/api/mutations/attempts";
import { useAttemptSheetQuery } from "@/api/queries/attempts";
import { BackLink } from "@/components/Layout/AppShell";
import { Reveal } from "@/components/Motion";
import { Redirect } from "@/components/Redirect";
import { ErrorState, PageLoader } from "@/components/States";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/axios";
import { cn } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";

const LETTERS = ["A", "B", "C", "D"];

interface AttemptForm {
  answers: Record<string, string>;
}

/** One answer bubble. The fill pops in like a pencil mark when picked. */
function Bubble({ letter, filled, size = "md" }: { letter: string; filled: boolean; size?: "sm" | "md" }) {
  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center rounded-full border-[1.5px] font-semibold transition-colors",
        size === "md" ? "size-9 text-xs" : "size-5 text-[8px]",
        filled ? "border-ink text-white" : "border-ink/35 text-ink-soft",
      )}
      aria-hidden
    >
      {filled && <span className="absolute inset-[2px] animate-pop rounded-full bg-ink" />}
      <span className="relative">{letter}</span>
    </span>
  );
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
  const pct = total ? (answered / total) * 100 : 0;

  const onSubmit = async (values: AttemptForm) => {
    await submit.mutateAsync({
      answers: quiz.questions.map((q) => ({
        questionId: q.id,
        optionId: values.answers[q.id]!,
      })),
    });
    router.replace(`/student/quizzes/${quizId}/result`);
  };

  const jumpTo = (id: string) =>
    document.getElementById(`q-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Reveal className="grid gap-8 lg:grid-cols-[1fr_15rem] lg:gap-10">
        <div className="min-w-0">
          <BackLink href="/student">Back to my quizzes</BackLink>
          <h1 data-reveal className="text-4xl font-extrabold leading-[1.05] sm:text-5xl">
            {quiz.title}
          </h1>
          {quiz.description && (
            <p data-reveal className="mt-2.5 max-w-xl text-[1.05rem] text-ink-soft">
              {quiz.description}
            </p>
          )}

          <ol className="mt-9 space-y-5">
            {quiz.questions.map((q, qi) => {
              const picked = answers?.[q.id];
              return (
                <li key={q.id} id={`q-${q.id}`} data-reveal className="scroll-mt-24">
                  <fieldset
                    className={cn(
                      "ruled sheet rounded-2xl py-5 pl-16 pr-5 transition-shadow sm:py-6 sm:pl-[4.75rem] sm:pr-7",
                      picked && "shadow-[var(--shadow-sheet),inset_0_0_0_1.5px_rgba(25,33,74,0.12)]",
                    )}
                  >
                    <legend className="sr-only">Question {qi + 1}</legend>
                    <span
                      aria-hidden
                      className="absolute left-0 top-5 w-[3.25rem] text-center font-display text-2xl font-extrabold tabular-nums text-ink/30 max-sm:w-10 max-sm:text-xl sm:top-6"
                    >
                      {qi + 1}
                    </span>
                    <p className="mb-4 font-display text-lg font-bold leading-snug sm:text-xl">{q.prompt}</p>
                    <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={q.prompt}>
                      {q.options.map((o, oi) => {
                        const selected = picked === o.id;
                        return (
                          <button
                            key={o.id}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => setValue(`answers.${q.id}`, o.id, { shouldDirty: true })}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-xl border-[1.5px] px-3 py-2.5 text-left transition-all duration-200 active:scale-[0.98]",
                              selected
                                ? "border-ink bg-pencil-soft shadow-[0_3px_0_0_var(--color-ink)]"
                                : "border-line bg-paper hover:-translate-y-px hover:border-ink/40",
                            )}
                          >
                            <Bubble letter={LETTERS[oi] ?? String(oi + 1)} filled={selected} />
                            <span className="text-[0.95rem] leading-snug">{o.text}</span>
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Answer sheet rail: mirrors every mark, and jumps to a question. */}
        <aside data-reveal className="hidden lg:block">
          <div className="sheet sticky top-24 rounded-2xl p-4">
            <div className="mb-3 flex items-end justify-between border-b-2 border-ink pb-2">
              <span className="font-display text-sm font-extrabold">Answer sheet</span>
              <span className="text-xs tabular-nums text-ink-soft">
                {answered}/{total}
              </span>
            </div>
            <ol className="max-h-[60vh] space-y-1 overflow-y-auto pr-1">
              {quiz.questions.map((q, qi) => (
                <li key={q.id}>
                  <button
                    type="button"
                    onClick={() => jumpTo(q.id)}
                    aria-label={`Go to question ${qi + 1}${answers?.[q.id] ? ", answered" : ""}`}
                    className="flex w-full items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-ink/[0.05]"
                  >
                    <span className="w-5 text-right text-xs tabular-nums text-ink-soft">{qi + 1}</span>
                    {q.options.map((o, oi) => (
                      <Bubble key={o.id} size="sm" letter={LETTERS[oi] ?? ""} filled={answers?.[q.id] === o.id} />
                    ))}
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </Reveal>

      <div className="sticky bottom-4 z-20 mt-10 lg:mr-[17.5rem]">
        <div className="flex items-center gap-4 rounded-2xl border border-ink/10 bg-paper/90 p-3 pl-5 shadow-[var(--shadow-lift)] backdrop-blur-xl">
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-sm font-medium">
              <span className="font-display text-base font-extrabold tabular-nums">{answered}</span>
              <span className="text-ink-soft"> of {total} answered</span>
              {answered < total && <span className="hidden text-ink-soft sm:inline">. You can submit once.</span>}
            </p>
            <div
              role="progressbar"
              aria-label="Answered questions"
              aria-valuenow={Math.round(pct)}
              aria-valuemin={0}
              aria-valuemax={100}
              className="relative h-2 overflow-hidden rounded-full bg-ink/[0.08]"
            >
              <div
                className="h-full rounded-full bg-pencil transition-[width] duration-500 ease-[cubic-bezier(.34,1.4,.64,1)]"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
          <Button type="submit" size="lg" disabled={answered < total} loading={submit.isPending}>
            Submit answers
          </Button>
        </div>
      </div>
    </form>
  );
}
