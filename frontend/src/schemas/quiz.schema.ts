import { z } from "zod";

export const questionFormSchema = z
  .object({
    prompt: z.string().trim().min(1, "Write the question").max(500),
    options: z
      .array(z.object({ text: z.string().trim().min(1, "Fill in this option").max(250) }))
      .length(4),
    correctIndex: z.number().int().min(0).max(3),
  })
  .superRefine((q, ctx) => {
    const seen = new Set<string>();
    q.options.forEach((o, i) => {
      const key = o.text.trim().toLowerCase();
      if (key && seen.has(key)) {
        ctx.addIssue({
          code: "custom",
          path: ["options", i, "text"],
          message: "Options must be different",
        });
      }
      seen.add(key);
    });
  });

export const quizFormSchema = z.object({
  title: z.string().trim().min(3, "Give the quiz a title").max(120),
  description: z.string().trim().max(1000).optional(),
  questions: z.array(questionFormSchema).min(1, "Add at least one question").max(50),
});

export type QuizFormValues = z.infer<typeof quizFormSchema>;
