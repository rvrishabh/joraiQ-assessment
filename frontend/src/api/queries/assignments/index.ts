import { api } from "@/lib/axios";
import type { MyAssignment, QuizAssignmentRow } from "@/types";
import { useQuery } from "@tanstack/react-query";

export const assignmentQueryKeys = {
  all: ["assignments"] as const,
  mine: () => [...assignmentQueryKeys.all, "mine"] as const,
  forQuiz: (quizId: string) => [...assignmentQueryKeys.all, "quiz", quizId] as const,
};

export function useMyAssignmentsQuery() {
  return useQuery({
    queryKey: assignmentQueryKeys.mine(),
    queryFn: async () => (await api.get<MyAssignment[]>("/assignments/mine")).data,
  });
}

export function useQuizAssignmentsQuery(quizId: string) {
  return useQuery({
    queryKey: assignmentQueryKeys.forQuiz(quizId),
    queryFn: async () =>
      (await api.get<QuizAssignmentRow[]>(`/quizzes/${quizId}/assignments`)).data,
  });
}
