"use client";

import { useMyAssignmentsQuery } from "@/api/queries/assignments";
import { PageHeader } from "@/components/Layout/AppShell";
import { EmptyState, ErrorState, PageLoader } from "@/components/States";
import { useAuth } from "@/hooks/useAuth";

import { AssignmentList } from "./_components/AssignmentList";

export default function StudentDashboard() {
  const { user } = useAuth();
  const mine = useMyAssignmentsQuery();
  const pending = mine.data?.filter((a) => a.status === "PENDING").length ?? 0;

  return (
    <>
      <PageHeader
        title={`Hi, ${user?.fullName.split(" ")[0] ?? "there"}`}
        subtitle={
          mine.data && mine.data.length > 0
            ? pending > 0
              ? `${pending} ${pending === 1 ? "quiz is" : "quizzes are"} waiting for you.`
              : "You are all caught up."
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
      {mine.data && mine.data.length > 0 && <AssignmentList items={mine.data} />}
    </>
  );
}
