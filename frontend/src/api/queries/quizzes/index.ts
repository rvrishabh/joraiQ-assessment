import { api } from "@/lib/axios";
import type { QuizDetail, QuizSummary } from "@/types";
import { useQuery } from "@tanstack/react-query";

export const quizQueryKeys = {
  all: ["quizzes"] as const,
  list: () => [...quizQueryKeys.all, "list"] as const,
  detail: (id: string) => [...quizQueryKeys.all, "detail", id] as const,
};

export function useQuizzesQuery() {
  return useQuery({
    queryKey: quizQueryKeys.list(),
    queryFn: async () => (await api.get<QuizSummary[]>("/quizzes")).data,
  });
}

export function useQuizDetailQuery(quizId: string) {
  return useQuery({
    queryKey: quizQueryKeys.detail(quizId),
    queryFn: async () => (await api.get<QuizDetail>(`/quizzes/${quizId}`)).data,
  });
}
