"use client";

import { useMyAssignmentsQuery } from "@/api/queries/assignments";
import { PageHeader } from "@/components/Layout/AppShell";
import { CountUp, Highlighted, Reveal } from "@/components/Motion";
import { EmptyState, ErrorState, PageLoader } from "@/components/States";
import { useAuth } from "@/hooks/useAuth";

import { AssignmentList } from "./_components/AssignmentList";

export default function StudentDashboard() {
  const { user } = useAuth();
  const mine = useMyAssignmentsQuery();
  const items = mine.data ?? [];
  const pending = items.filter((a) => a.status === "PENDING").length;
  const finished = items.filter((a) => a.status === "COMPLETED");
  const avg = finished.length
    ? finished.reduce((n, a) => n + (a.accuracy ?? 0), 0) / finished.length
    : null;

  return (
    <Reveal deps={[mine.data?.length]}>
      <PageHeader
        title={<Highlighted>Hi, {user?.fullName.split(" ")[0] ?? "there"}</Highlighted>}
        subtitle={
          items.length > 0
            ? pending > 0
              ? `${pending} ${pending === 1 ? "quiz is" : "quizzes are"} waiting for you.`
              : "You are all caught up. Nice work."
            : "Quizzes your teachers assign will show up here."
        }
      />

      {mine.isLoading && <PageLoader />}
      {mine.isError && <ErrorState error={mine.error} onRetry={() => mine.refetch()} />}
      {mine.data && mine.data.length === 0 && (
        <EmptyState
          title="Nothing assigned yet"
          body="When a teacher assigns you a quiz it will appear here, ready to start."
        />
      )}
      {mine.data && mine.data.length > 0 && (
        <>
          <dl data-reveal className="mb-10 grid grid-cols-3 gap-3 sm:max-w-xl">
            <Stat label="To do" value={pending} />
            <Stat label="Finished" value={finished.length} />
            <Stat label="Average score" value={avg} suffix="%" />
          </dl>
          <AssignmentList items={mine.data} />
        </>
      )}
    </Reveal>
  );
}

function Stat({ label, value, suffix }: { label: string; value: number | null; suffix?: string }) {
  return (
    <div className="sheet rounded-xl px-4 py-3">
      <dd className="font-display text-3xl font-extrabold">
        {value === null ? "-" : <CountUp value={Math.round(value)} suffix={suffix} />}
      </dd>
      <dt className="text-xs font-medium text-ink-soft">{label}</dt>
    </div>
  );
}
