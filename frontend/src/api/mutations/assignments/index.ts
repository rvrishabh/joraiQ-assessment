import { assignmentQueryKeys } from "@/api/queries/assignments";
import { quizQueryKeys } from "@/api/queries/quizzes";
import { api } from "@/lib/axios";
import { toastApiError } from "@/lib/query-utils";
import type { AssignResult } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAssignQuizMutation(quizId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (studentIds: string[]) =>
      (await api.post<AssignResult>(`/quizzes/${quizId}/assignments`, { studentIds })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentQueryKeys.forQuiz(quizId) });
      queryClient.invalidateQueries({ queryKey: quizQueryKeys.all });
    },
    onError: (err) => toastApiError(err, "Could not assign the quiz"),
  });
}
