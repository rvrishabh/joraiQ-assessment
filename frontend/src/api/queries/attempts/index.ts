import { api } from "@/lib/axios";
import type { AttemptSheet, QuizResult } from "@/types";
import { useQuery } from "@tanstack/react-query";

export const attemptQueryKeys = {
  sheet: (quizId: string) => ["attempt", "sheet", quizId] as const,
  result: (quizId: string) => ["attempt", "result", quizId] as const,
};

export function useAttemptSheetQuery(quizId: string) {
  return useQuery({
    queryKey: attemptQueryKeys.sheet(quizId),
    queryFn: async () => (await api.get<AttemptSheet>(`/quizzes/${quizId}/attempt`)).data,
    retry: false,
    // The sheet must never be reused once it has been loaded for an attempt.
    staleTime: Infinity,
    gcTime: 0,
  });
}

export function useQuizResultQuery(quizId: string) {
  return useQuery({
    queryKey: attemptQueryKeys.result(quizId),
    queryFn: async () => (await api.get<QuizResult>(`/quizzes/${quizId}/result`)).data,
    retry: false,
  });
}
