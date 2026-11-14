"use client";

import type { QuizSummary } from "@/types";

export function TeacherSummary({ quizzes }: { quizzes: QuizSummary[] }) {
  const assigned = quizzes.reduce((n, q) => n + q.assignedCount, 0);
  const completed = quizzes.reduce((n, q) => n + q.completedCount, 0);
  const items = [
    { label: "Quizzes created", value: quizzes.length },
    { label: "Assignments handed out", value: assigned },
    { label: "Submissions received", value: completed },
  ];
  return (
    <dl className="mb-8 grid grid-cols-3 divide-x divide-line overflow-hidden rounded-xl border border-line bg-paper">
      {items.map((item) => (
        <div key={item.label} className="px-4 py-4 sm:px-6">
          <dd className="font-display text-3xl font-bold tabular-nums">{item.value}</dd>
          <dt className="mt-0.5 text-xs text-ink-soft sm:text-sm">{item.label}</dt>
        </div>
      ))}
    </dl>
  );
}
