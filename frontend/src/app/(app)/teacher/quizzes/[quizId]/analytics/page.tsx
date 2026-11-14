"use client";

import { useQuizAnalyticsQuery } from "@/api/queries/analytics";
import { PageHeader } from "@/components/Layout/AppShell";
import { EmptyState, ErrorState, PageLoader } from "@/components/States";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatDate, formatPercent } from "@/lib/format";
import { ArrowLeft, Trophy } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function AnalyticsPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const analytics = useQuizAnalyticsQuery(quizId);
  const data = analytics.data;

  return (
    <>
      <Link
        href="/teacher"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden /> All quizzes
      </Link>
      <PageHeader
        title={data?.title ?? "Quiz results"}
        subtitle="How each assigned student is doing on this quiz."
        actions={
          <div className="flex gap-2">
            <Link href={`/teacher/quizzes/${quizId}/assign`}>
              <Button variant="secondary">Assign more</Button>
            </Link>
            <Link href={`/quizzes/${quizId}/leaderboard`}>
              <Button variant="secondary">
                <Trophy className="size-4" aria-hidden /> Leaderboard
              </Button>
            </Link>
          </div>
        }
      />

      {analytics.isLoading && <PageLoader />}
      {analytics.isError && (
        <ErrorState
          error={analytics.error}
          onRetry={() => analytics.refetch()}
        />
      )}

      {data && (
        <>
          <dl className="mb-8 grid grid-cols-3 divide-x divide-line overflow-hidden rounded-xl border border-line bg-paper">
            <Stat
              label="Students assigned"
              value={String(data.assignedCount)}
            />
            <Stat
              label="Completed"
              value={`${data.completedCount}`}
              sub={`of ${data.assignedCount}`}
            />
            <Stat
              label="Average accuracy"
              value={formatPercent(data.averageAccuracy)}
            />
          </dl>

          {data.students.length === 0 ? (
            <EmptyState
              title="Nobody has this quiz yet"
              body="Assign it to students and their scores will show up here."
              action={
                <Link href={`/teacher/quizzes/${quizId}/assign`}>
                  <Button>Assign students</Button>
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-line bg-paper">
              <table className="w-full min-w-160 text-left text-sm">
                <thead className="border-b border-line bg-sheet/60 text-ink-soft">
                  <tr>
                    <th className="px-4 py-3 font-medium">Student</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Score</th>
                    <th className="w-56 px-4 py-3 font-medium">Accuracy</th>
                    <th className="px-4 py-3 font-medium">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.students.map((s) => (
                    <tr key={s.studentId}>
                      <td className="px-4 py-3">
                        <p className="font-medium">{s.fullName}</p>
                        <p className="text-xs text-ink-soft">{s.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          tone={s.status === "COMPLETED" ? "done" : "pending"}
                        >
                          {s.status === "COMPLETED"
                            ? "Completed"
                            : "Not completed"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {s.correctCount === null
                          ? "-"
                          : `${s.correctCount} / ${s.totalQuestions}`}
                      </td>
                      <td className="px-4 py-3">
                        {s.accuracy === null ? (
                          <span className="text-ink-soft">-</span>
                        ) : (
                          <div className="flex items-center gap-3">
                            <ProgressBar
                              value={s.accuracy}
                              label={`${s.fullName} accuracy`}
                            />
                            <span className="w-12 text-right tabular-nums">
                              {formatPercent(s.accuracy)}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-ink-soft">
                        {formatDate(s.submittedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="px-4 py-4 sm:px-6">
      <dd className="font-display text-3xl font-bold tabular-nums">
        {value}{" "}
        {sub && (
          <span className="text-base font-medium text-ink-soft">{sub}</span>
        )}
      </dd>
      <dt className="mt-0.5 text-xs text-ink-soft sm:text-sm">{label}</dt>
    </div>
  );
}
