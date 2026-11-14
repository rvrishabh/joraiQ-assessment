import { api } from "@/lib/axios";
import type { QuizAnalytics } from "@/types";
import { useQuery } from "@tanstack/react-query";

export const analyticsQueryKeys = {
  quiz: (quizId: string) => ["analytics", quizId] as const,
};

export function useQuizAnalyticsQuery(quizId: string) {
  return useQuery({
    queryKey: analyticsQueryKeys.quiz(quizId),
    queryFn: async () =>
      (await api.get<QuizAnalytics>(`/quizzes/${quizId}/analytics`)).data,
  });
}
