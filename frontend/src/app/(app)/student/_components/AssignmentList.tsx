"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatPercent, pluralize } from "@/lib/format";
import type { MyAssignment } from "@/types";
import Link from "next/link";
import { Play, Trophy } from "lucide-react";

export function AssignmentList({ items }: { items: MyAssignment[] }) {
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-paper">
      {items.map((a) => {
        const done = a.status === "COMPLETED";
        return (
          <li key={a.assignmentId} className="grid gap-4 p-5 md:grid-cols-[1.5fr_1fr_auto] md:items-center">
            <div className="min-w-0">
              <p className="truncate font-display text-lg font-semibold">{a.title}</p>
              <p className="mt-0.5 text-sm text-ink-soft">
                {pluralize(a.questionCount, "question")} - from {a.teacherName} - assigned {formatDate(a.assignedAt)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Badge tone={done ? "done" : "pending"}>{done ? "Completed" : "Not started"}</Badge>
              {done && (
                <span className="text-sm tabular-nums text-ink-soft">
                  {a.correctCount}/{a.questionCount} - {formatPercent(a.accuracy)}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              {done ? (
                <Link href={`/student/quizzes/${a.quizId}/result`}>
                  <Button variant="secondary" size="sm">View result</Button>
                </Link>
              ) : (
                <Link href={`/student/quizzes/${a.quizId}/attempt`}>
                  <Button size="sm">
                    <Play className="size-4" aria-hidden /> Start quiz
                  </Button>
                </Link>
              )}
              <Link href={`/quizzes/${a.quizId}/leaderboard`}>
                <Button variant="ghost" size="sm" aria-label={`${a.title} leaderboard`}>
                  <Trophy className="size-4" aria-hidden />
                </Button>
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
