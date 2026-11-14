"use client";

import { useCreateQuizMutation } from "@/api/mutations/quizzes";
import { PageHeader } from "@/components/Layout/AppShell";
import FormInput from "@/components/Form/FormInput";
import FormTextArea from "@/components/Form/FormTextArea";
import { Button } from "@/components/ui/button";
import { quizFormSchema, type QuizFormValues } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { QuestionEditor } from "../../_components/QuestionEditor";

const blankQuestion = (): QuizFormValues["questions"][number] => ({
  prompt: "",
  options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
  correctIndex: 0,
});

export default function NewQuizPage() {
  const router = useRouter();
  const createQuiz = useCreateQuizMutation();
  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: { title: "", description: "", questions: [blankQuestion()] },
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "questions" });

  const onSubmit = async (values: QuizFormValues) => {
    const quiz = await createQuiz.mutateAsync(values);
    toast.success("Quiz saved. Pick who should take it.");
    router.push(`/teacher/quizzes/${quiz.id}/assign`);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="mx-auto max-w-3xl">
        <PageHeader title="New quiz" subtitle="Each question has four options and one correct answer." />

        <div className="space-y-4 rounded-xl border border-line bg-paper p-5 sm:p-6">
          <FormInput
            label="Title"
            placeholder="Fractions, week 3"
            error={form.formState.errors.title?.message}
            {...form.register("title")}
          />
          <FormTextArea
            label="Description (optional)"
            placeholder="What does this quiz cover?"
            error={form.formState.errors.description?.message}
            {...form.register("description")}
          />
        </div>

        <div className="mt-6 space-y-4">
          {fields.map((field, index) => (
            <QuestionEditor
              key={field.id}
              index={index}
              canRemove={fields.length > 1}
              onRemove={() => remove(index)}
            />
          ))}
          {form.formState.errors.questions?.root?.message && (
            <p role="alert" className="text-sm text-redpen">
              {form.formState.errors.questions.root.message}
            </p>
          )}
          <Button variant="secondary" onClick={() => append(blankQuestion())} className="w-full">
            <Plus className="size-4" aria-hidden /> Add question
          </Button>
        </div>

        <div className="sticky bottom-0 -mx-4 mt-8 flex items-center justify-between gap-3 border-t border-line bg-sheet/95 px-4 py-4 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:px-5">
          <span className="text-sm text-ink-soft">{fields.length} {fields.length === 1 ? "question" : "questions"}</span>
          <div className="flex gap-2">
            <Link href="/teacher">
              <Button variant="ghost">Cancel</Button>
            </Link>
            <Button type="submit" loading={createQuiz.isPending}>
              Save quiz
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
