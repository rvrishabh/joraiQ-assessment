import { assignmentQueryKeys } from "@/api/queries/assignments";
import { attemptQueryKeys } from "@/api/queries/attempts";
import { leaderboardQueryKeys } from "@/api/queries/leaderboard";
import { api } from "@/lib/axios";
import { toastApiError } from "@/lib/query-utils";
import type { QuizResult } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface SubmitAnswers {
  answers: Array<{ questionId: string; optionId: string }>;
}

export function useSubmitAttemptMutation(quizId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SubmitAnswers) =>
      (await api.post<QuizResult>(`/quizzes/${quizId}/attempts`, payload)).data,
    onSuccess: (result) => {
      queryClient.setQueryData(attemptQueryKeys.result(quizId), result);
      queryClient.removeQueries({ queryKey: attemptQueryKeys.sheet(quizId) });
      queryClient.invalidateQueries({ queryKey: assignmentQueryKeys.mine() });
      queryClient.invalidateQueries({ queryKey: leaderboardQueryKeys.quiz(quizId) });
    },
    onError: (err) => toastApiError(err, "Could not submit the quiz"),
  });
}
