"use client";

import { useQuizAnalyticsQuery } from "@/api/queries/analytics";
import { BackLink, PageHeader } from "@/components/Layout/AppShell";
import { CountUp, prefersReducedMotion, Reveal } from "@/components/Motion";
import { EmptyState, ErrorState, PageLoader } from "@/components/States";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatDate, formatPercent, initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Trophy, UserPlus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

/** Donut showing the share of assigned students who have submitted. */
function CompletionDonut({ done, total }: { done: number; total: number }) {
  const arc = useRef<SVGCircleElement>(null);
  const r = 34;
  const c = 2 * Math.PI * r;
  const target = c * (1 - (total ? done / total : 0));
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(arc.current, { strokeDashoffset: c }, { strokeDashoffset: target, duration: 1.2, delay: 0.3, ease: "power3.out" });
    },
    { dependencies: [target] },
  );
  return (
    <svg viewBox="0 0 84 84" className="size-20 shrink-0 -rotate-90" aria-hidden>
      <circle cx="42" cy="42" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="10" />
      <circle
        ref={arc}
        cx="42"
        cy="42"
        r={r}
        fill="none"
        stroke="var(--color-pencil)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={target}
      />
    </svg>
  );
}

export default function AnalyticsPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const analytics = useQuizAnalyticsQuery(quizId);
  const data = analytics.data;

  return (
    <Reveal deps={[!!data]}>
      <BackLink href="/teacher">All quizzes</BackLink>
      <PageHeader
        title={data?.title ?? "Quiz results"}
        subtitle="How each assigned student is doing on this quiz."
        actions={
          <div className="flex gap-2">
            <Link href={`/teacher/quizzes/${quizId}/assign`}>
              <Button variant="secondary">
                <UserPlus className="size-4" aria-hidden /> Assign more
              </Button>
            </Link>
            <Link href={`/quizzes/${quizId}/leaderboard`}>
              <Button variant="pencil">
                <Trophy className="size-4" aria-hidden /> Leaderboard
              </Button>
            </Link>
          </div>
        }
      />

      {analytics.isLoading && <PageLoader />}
      {analytics.isError && <ErrorState error={analytics.error} onRetry={() => analytics.refetch()} />}

      {data && (
        <>
          <dl data-reveal className="mb-10 grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-4 rounded-2xl bg-ink p-5 text-white sm:col-span-1">
              <CompletionDonut done={data.completedCount} total={data.assignedCount} />
              <div>
                <dd className="font-display text-3xl font-extrabold">
                  <CountUp value={data.completedCount} />
                  <span className="text-lg text-white/50">/{data.assignedCount}</span>
                </dd>
                <dt className="text-xs font-medium text-white/60">Students finished</dt>
              </div>
            </div>
            <div className="sheet rounded-2xl p-5">
              <dd className="font-display text-4xl font-extrabold">
                {data.averageAccuracy === null ? "-" : <CountUp value={Math.round(data.averageAccuracy)} suffix="%" />}
              </dd>
              <dt className="mb-3 text-xs font-medium text-ink-soft">Average accuracy</dt>
              <ProgressBar value={data.averageAccuracy ?? 0} tone="auto" label="Average accuracy" />
            </div>
            <div className="sheet rounded-2xl p-5">
              <dd className="font-display text-4xl font-extrabold">
                <CountUp value={data.assignedCount - data.completedCount} />
              </dd>
              <dt className="text-xs font-medium text-ink-soft">Still to submit</dt>
            </div>
          </dl>

          {data.students.length === 0 ? (
            <EmptyState
              title="Nobody has this quiz yet"
              body="Assign it to students and their scores will show up here."
              action={
                <Link href={`/teacher/quizzes/${quizId}/assign`}>
                  <Button variant="pencil">Assign students</Button>
                </Link>
              }
            />
          ) : (
            <div data-reveal className="sheet overflow-x-auto rounded-2xl">
              <table className="w-full min-w-160 text-left text-sm">
                <thead className="border-b border-line text-xs text-ink-soft">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">Student</th>
                    <th className="px-4 py-3.5 font-semibold">Status</th>
                    <th className="px-4 py-3.5 font-semibold">Score</th>
                    <th className="w-60 px-4 py-3.5 font-semibold">Accuracy</th>
                    <th className="px-5 py-3.5 font-semibold">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.students.map((s) => (
                    <tr key={s.studentId} className="transition-colors hover:bg-sheet/60">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "grid size-9 shrink-0 place-items-center rounded-full font-display text-xs font-bold",
                              s.status === "COMPLETED" ? "bg-mark-soft text-mark" : "bg-sheet text-ink-soft",
                            )}
                          >
                            {initials(s.fullName)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{s.fullName}</p>
                            <p className="truncate text-xs text-ink-soft">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge tone={s.status === "COMPLETED" ? "done" : "pending"}>
                          {s.status === "COMPLETED" ? "Completed" : "Not completed"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        {s.correctCount === null ? (
                          <span className="text-ink-soft">-</span>
                        ) : (
                          <span className="hand -rotate-3 inline-block text-2xl text-redpen">
                            {s.correctCount}/{s.totalQuestions}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {s.accuracy === null ? (
                          <span className="text-ink-soft">-</span>
                        ) : (
                          <div className="flex items-center gap-3">
                            <ProgressBar value={s.accuracy} tone="auto" label={`${s.fullName} accuracy`} />
                            <span className="w-12 text-right font-semibold tabular-nums">{formatPercent(s.accuracy)}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-ink-soft">{formatDate(s.submittedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </Reveal>
  );
}
