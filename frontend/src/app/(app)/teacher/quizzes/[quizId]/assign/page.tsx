"use client";

import { useAssignQuizMutation } from "@/api/mutations/assignments";
import { useQuizAssignmentsQuery } from "@/api/queries/assignments";
import { useQuizDetailQuery } from "@/api/queries/quizzes";
import { useStudentsQuery } from "@/api/queries/students";
import { BackLink, PageHeader } from "@/components/Layout/AppShell";
import { Reveal } from "@/components/Motion";
import { EmptyState, ErrorState, PageLoader } from "@/components/States";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, initials, pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Check, Search } from "lucide-react";
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

  const ready = students.data && assignments.data;

  return (
    <Reveal className="mx-auto max-w-4xl" deps={[!!ready]}>
      <BackLink href="/teacher">All quizzes</BackLink>
      <PageHeader
        title={quiz.data ? quiz.data.title : "Assign quiz"}
        subtitle="Choose who should take this quiz. Students who already have it are marked."
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

      {ready && students.data.length === 0 && (
        <EmptyState
          title="No students have registered"
          body="Students appear here once they create a student account."
        />
      )}

      {ready && students.data.length > 0 && (
        <div data-reveal className="sheet overflow-hidden rounded-2xl">
          <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
            <div className="relative min-w-52 flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-soft" aria-hidden />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email"
                aria-label="Search students"
                className="h-11 w-full rounded-[10px] border border-line bg-sheet/60 pl-10 pr-3 text-sm outline-none transition-[border-color,box-shadow] focus:border-ink focus:bg-paper focus:shadow-[0_0_0_4px_rgba(255,201,60,0.45)]"
              />
            </div>
            <button
              type="button"
              onClick={toggleAll}
              disabled={selectable.length === 0}
              className="inline-flex h-11 items-center gap-2 rounded-[10px] px-3 text-sm font-semibold transition-colors hover:bg-ink/[0.05] disabled:opacity-40"
            >
              <CheckBubble checked={allSelected} />
              Select all available
            </button>
          </div>

          {visible.length === 0 ? (
            <p className="p-10 text-center text-sm text-ink-soft">No students match &ldquo;{search}&rdquo;.</p>
          ) : (
            <ul className="grid sm:grid-cols-2">
              {visible.map((s) => {
                const existing = statusByStudent.get(s.id);
                const isOn = selected.has(s.id);
                return (
                  <li key={s.id} className="border-b border-line sm:odd:border-r">
                    <label
                      className={cn(
                        "flex items-center gap-3 px-4 py-3.5 transition-colors has-[:focus-visible]:bg-pencil-soft",
                        existing ? "cursor-default" : "cursor-pointer hover:bg-sheet/70",
                        isOn && "bg-pencil-soft",
                      )}
                    >
                      <input
                        type="checkbox"
                        disabled={!!existing}
                        checked={isOn}
                        onChange={() => toggle(s.id)}
                        className="sr-only"
                      />
                      {existing ? (
                        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sheet font-display text-sm font-bold text-ink-soft">
                          {initials(s.fullName)}
                        </span>
                      ) : (
                        <span
                          className={cn(
                            "grid size-10 shrink-0 place-items-center rounded-full border-2 font-display text-sm font-bold transition-all duration-200",
                            isOn ? "scale-105 border-ink bg-ink text-white" : "border-ink/20 text-ink",
                          )}
                        >
                          {isOn ? <Check className="size-4 animate-pop" strokeWidth={3} aria-hidden /> : initials(s.fullName)}
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className={cn("block truncate font-semibold", existing && "text-ink-soft")}>{s.fullName}</span>
                        <span className="block truncate text-xs text-ink-soft">
                          {existing ? `Assigned ${formatDate(existing.assignedAt)}` : s.email}
                        </span>
                      </span>
                      {existing && (
                        <Badge tone={existing.status === "COMPLETED" ? "done" : "pending"}>
                          {existing.status === "COMPLETED" ? "Done" : "Pending"}
                        </Badge>
                      )}
                    </label>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="sticky bottom-0 flex items-center justify-between gap-3 bg-paper/95 p-4 backdrop-blur">
            <span className="text-sm">
              <span className="font-display text-base font-extrabold tabular-nums">{selected.size}</span>
              <span className="text-ink-soft"> selected</span>
            </span>
            <Button onClick={() => void submit()} disabled={selected.size === 0} loading={assign.isPending} size="lg">
              {selected.size === 0 ? "Assign" : `Assign to ${pluralize(selected.size, "student")}`}
            </Button>
          </div>
        </div>
      )}
    </Reveal>
  );
}

function CheckBubble({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-5 place-items-center rounded-full border-2 transition-colors",
        checked ? "border-ink bg-ink text-white" : "border-ink/30",
      )}
    >
      {checked && <Check className="size-3" strokeWidth={3.5} />}
    </span>
  );
}
