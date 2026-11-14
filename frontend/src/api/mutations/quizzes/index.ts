import { quizQueryKeys } from "@/api/queries/quizzes";
import { api } from "@/lib/axios";
import { toastApiError } from "@/lib/query-utils";
import type { QuizFormValues } from "@/schemas";
import type { QuizDetail } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateQuizMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: QuizFormValues) => {
      const payload = {
        title: values.title,
        description: values.description || undefined,
        questions: values.questions.map((q) => ({
          prompt: q.prompt,
          options: q.options.map((o) => o.text),
          correctIndex: q.correctIndex,
        })),
      };
      return (await api.post<QuizDetail>("/quizzes", payload)).data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: quizQueryKeys.all }),
    onError: (err) => toastApiError(err, "Could not save the quiz"),
  });
}
