"use client";

import { CountUp } from "@/components/Motion";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { QuizSummary } from "@/types";

export function TeacherSummary({ quizzes }: { quizzes: QuizSummary[] }) {
  const assigned = quizzes.reduce((n, q) => n + q.assignedCount, 0);
  const completed = quizzes.reduce((n, q) => n + q.completedCount, 0);
  const rate = assigned ? (completed / assigned) * 100 : 0;

  return (
    <dl data-reveal className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-[1fr_1fr_1fr_1.4fr]">
      <Stat label="Quizzes written" value={quizzes.length} />
      <Stat label="Handed out" value={assigned} />
      <Stat label="Submissions in" value={completed} />
      <div className="col-span-2 rounded-2xl bg-ink p-4 text-white md:col-span-1 sm:p-5">
        <dd className="flex items-baseline gap-2 font-display text-4xl font-extrabold">
          <CountUp value={Math.round(rate)} suffix="%" />
        </dd>
        <dt className="mb-3 text-xs font-medium text-white/60">Of handed-out quizzes are finished</dt>
        <ProgressBar value={rate} tone="pencil" label="Overall completion" className="bg-white/15" />
      </div>
    </dl>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="sheet rounded-2xl p-4 sm:p-5">
      <dd className="font-display text-4xl font-extrabold">
        <CountUp value={value} />
      </dd>
      <dt className="text-xs font-medium text-ink-soft">{label}</dt>
    </div>
  );
}
