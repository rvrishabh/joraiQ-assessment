"use client";

import { useCreateQuizMutation } from "@/api/mutations/quizzes";
import { BackLink, PageHeader } from "@/components/Layout/AppShell";
import FormInput from "@/components/Form/FormInput";
import FormTextArea from "@/components/Form/FormTextArea";
import { Reveal } from "@/components/Motion";
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

  const addQuestion = () => {
    append(blankQuestion());
    // Bring the new sheet into view once it has rendered.
    requestAnimationFrame(() =>
      document.getElementById("add-question")?.scrollIntoView({ behavior: "smooth", block: "end" }),
    );
  };

  const onSubmit = async (values: QuizFormValues) => {
    const quiz = await createQuiz.mutateAsync(values);
    toast.success("Quiz saved. Pick who should take it.");
    router.push(`/teacher/quizzes/${quiz.id}/assign`);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <Reveal className="mx-auto max-w-3xl">
          <BackLink href="/teacher">All quizzes</BackLink>
          <PageHeader title="New quiz" subtitle="Each question has four options and one correct answer." />

          <div data-reveal className="sheet space-y-4 rounded-2xl p-5 sm:p-7">
            <FormInput
              label="Title"
              placeholder="Fractions, week 3"
              className="h-12 font-display text-lg font-bold"
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

          <div data-reveal className="mt-6 space-y-4">
            {fields.map((field, index) => (
              <QuestionEditor
                key={field.id}
                index={index}
                canRemove={fields.length > 1}
                onRemove={() => remove(index)}
              />
            ))}
            {form.formState.errors.questions?.root?.message && (
              <p role="alert" className="text-sm font-medium text-redpen">
                {form.formState.errors.questions.root.message}
              </p>
            )}
            <button
              id="add-question"
              type="button"
              onClick={addQuestion}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink/20 py-5 font-semibold text-ink-soft transition-all hover:border-ink/50 hover:bg-paper/70 hover:text-ink"
            >
              <span className="grid size-7 place-items-center rounded-full bg-pencil text-ink transition-transform duration-300 group-hover:rotate-90">
                <Plus className="size-4" strokeWidth={3} aria-hidden />
              </span>
              Add question
            </button>
          </div>
        </Reveal>

        <div className="sticky bottom-4 z-20 mx-auto mt-8 max-w-3xl">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-paper/90 p-3 pl-5 shadow-[var(--shadow-lift)] backdrop-blur-xl">
            <span className="text-sm">
              <span className="font-display text-base font-extrabold tabular-nums">{fields.length}</span>
              <span className="text-ink-soft"> {fields.length === 1 ? "question" : "questions"}</span>
            </span>
            <div className="flex gap-2">
              <Link href="/teacher">
                <Button variant="ghost" size="lg">Cancel</Button>
              </Link>
              <Button type="submit" size="lg" loading={createQuiz.isPending}>
                Save quiz
              </Button>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
