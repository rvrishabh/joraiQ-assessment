"use client";

import { useAssignQuizMutation } from "@/api/mutations/assignments";
import { useQuizAssignmentsQuery } from "@/api/queries/assignments";
import { useQuizDetailQuery } from "@/api/queries/quizzes";
import { useStudentsQuery } from "@/api/queries/students";
import { PageHeader } from "@/components/Layout/AppShell";
import { EmptyState, ErrorState, PageLoader } from "@/components/States";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, pluralize } from "@/lib/format";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function AssignPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const quiz = useQuizDetailQuery(quizId);
  const students = useStudentsQuery();
  const assignments = useQuizAssignmentsQuery(quizId);
  const assign = useAssignQuizMutation(quizId);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const statusByStudent = useMemo(
    () => new Map((assignments.data ?? []).map((a) => [a.studentId, a])),
    [assignments.data],
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (students.data ?? []).filter(
      (s) => !q || s.fullName.toLowerCase().includes(q) || s.email.toLowerCase().includes(q),
    );
  }, [students.data, search]);

  const selectable = visible.filter((s) => !statusByStudent.has(s.id));
  const allSelected = selectable.length > 0 && selectable.every((s) => selected.has(s.id));

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      selectable.forEach((s) => (allSelected ? next.delete(s.id) : next.add(s.id)));
      return next;
    });

  const submit = async () => {
    const result = await assign.mutateAsync([...selected]);
    setSelected(new Set());
    toast.success(`Assigned to ${pluralize(result.assigned, "student")}`);
  };

  if (quiz.isError) return <ErrorState error={quiz.error} onRetry={() => quiz.refetch()} />;

  return (
    <>
      <Link href="/teacher" className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> All quizzes
      </Link>
      <PageHeader
        title={quiz.data ? `Assign: ${quiz.data.title}` : "Assign quiz"}
        subtitle="Choose the students who should take this quiz. Students who already have it are marked."
        actions={
          <Link href={`/teacher/quizzes/${quizId}/analytics`}>
            <Button variant="secondary">View results</Button>
          </Link>
        }
      />

      {(students.isLoading || assignments.isLoading) && <PageLoader />}
      {(students.isError || assignments.isError) && (
        <ErrorState
          error={students.error ?? assignments.error}
          onRetry={() => {
            void students.refetch();
            void assignments.refetch();
          }}
        />
      )}

      {students.data && assignments.data && students.data.length === 0 && (
        <EmptyState
          title="No students have registered"
          body="Students appear here once they create a student account."
        />
      )}

      {students.data && assignments.data && students.data.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-line bg-paper">
          <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
            <div className="relative min-w-52 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" aria-hidden />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email"
                aria-label="Search students"
                className="h-10 w-full rounded-md border border-line bg-sheet/50 pl-9 pr-3 text-sm outline-none focus:border-ink"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={allSelected}
                disabled={selectable.length === 0}
                onChange={toggleAll}
                className="size-4 accent-ink"
              />
              Select all available
            </label>
          </div>

          {visible.length === 0 ? (
            <p className="p-8 text-center text-sm text-ink-soft">No students match "{search}".</p>
          ) : (
            <ul className="divide-y divide-line">
              {visible.map((s) => {
                const existing = statusByStudent.get(s.id);
                return (
                  <li key={s.id}>
                    <label
                      className={`flex items-center gap-4 px-4 py-3 ${existing ? "opacity-70" : "cursor-pointer hover:bg-sheet/60"}`}
                    >
                      <input
                        type="checkbox"
                        disabled={!!existing}
                        checked={selected.has(s.id)}
                        onChange={() => toggle(s.id)}
                        className="size-4 accent-ink"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{s.fullName}</span>
                        <span className="block truncate text-sm text-ink-soft">{s.email}</span>
                      </span>
                      {existing ? (
                        <span className="flex items-center gap-3">
                          <span className="hidden text-xs text-ink-soft sm:inline">
                            Assigned {formatDate(existing.assignedAt)}
                          </span>
                          <Badge tone={existing.status === "COMPLETED" ? "done" : "pending"}>
                            {existing.status === "COMPLETED" ? "Completed" : "Not completed"}
                          </Badge>
                        </span>
                      ) : (
                        <Badge>Not assigned</Badge>
                      )}
                    </label>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-line bg-sheet/50 p-4">
            <span className="text-sm text-ink-soft">{selected.size} selected</span>
            <Button onClick={() => void submit()} disabled={selected.size === 0} loading={assign.isPending}>
              Assign to {selected.size || ""} {selected.size === 1 ? "student" : "students"}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
