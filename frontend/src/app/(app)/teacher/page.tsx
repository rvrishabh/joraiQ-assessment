"use client";

import { useQuizzesQuery } from "@/api/queries/quizzes";
import { PageHeader } from "@/components/Layout/AppShell";
import { EmptyState, ErrorState, PageLoader } from "@/components/States";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { Plus } from "lucide-react";
import { QuizTable } from "./_components/QuizTable";
import { TeacherSummary } from "./_components/TeacherSummary";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const quizzes = useQuizzesQuery();
  const newQuiz = (
    <Link href="/teacher/quizzes/new">
      <Button>
        <Plus className="size-4" aria-hidden /> New quiz
      </Button>
    </Link>
  );

  return (
    <>
      <PageHeader
        title={`Hello, ${user?.fullName.split(" ")[0] ?? "teacher"}`}
        subtitle="Your quizzes and how far each class has got."
        actions={newQuiz}
      />

      {quizzes.isLoading && <PageLoader />}
      {quizzes.isError && <ErrorState error={quizzes.error} onRetry={() => quizzes.refetch()} />}
      {quizzes.data && quizzes.data.length === 0 && (
        <EmptyState
          title="No quizzes yet"
          body="Write a quiz with multiple-choice questions, then assign it to students."
          action={newQuiz}
        />
      )}
      {quizzes.data && quizzes.data.length > 0 && (
        <>
          <TeacherSummary quizzes={quizzes.data} />
          <QuizTable quizzes={quizzes.data} />
        </>
      )}
    </>
  );
}
