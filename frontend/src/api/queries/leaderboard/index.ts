import { api } from "@/lib/axios";
import type { Leaderboard } from "@/types";
import { useQuery } from "@tanstack/react-query";

export const leaderboardQueryKeys = {
  quiz: (quizId: string) => ["leaderboard", quizId] as const,
};

export function useLeaderboardQuery(quizId: string) {
  return useQuery({
    queryKey: leaderboardQueryKeys.quiz(quizId),
    queryFn: async () =>
      (await api.get<Leaderboard>(`/quizzes/${quizId}/leaderboard`)).data,
    retry: false,
  });
}
