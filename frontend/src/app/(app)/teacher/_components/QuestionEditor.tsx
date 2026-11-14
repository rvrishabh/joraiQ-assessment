"use client";

import FormInput from "@/components/Form/FormInput";
import FormTextArea from "@/components/Form/FormTextArea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { QuizFormValues } from "@/schemas";
import { Trash2 } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";

const LETTERS = ["A", "B", "C", "D"];

interface QuestionEditorProps {
  index: number;
  canRemove: boolean;
  onRemove: () => void;
}

export function QuestionEditor({ index, canRemove, onRemove }: QuestionEditorProps) {
  const { register, setValue, control, formState } = useFormContext<QuizFormValues>();
  const correct = useWatch({ control, name: `questions.${index}.correctIndex` });
  const errors = formState.errors.questions?.[index];

  return (
    <section className="rounded-xl border border-line bg-paper p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Question {index + 1}</h2>
        {canRemove && (
          <Button variant="ghost" size="sm" onClick={onRemove} aria-label={`Remove question ${index + 1}`}>
            <Trash2 className="size-4" aria-hidden /> Remove
          </Button>
        )}
      </div>

      <FormTextArea
        label="Question"
        placeholder="What do you want to ask?"
        error={errors?.prompt?.message}
        {...register(`questions.${index}.prompt`)}
      />

      <fieldset className="mt-5 space-y-3">
        <legend className="mb-1 text-sm font-medium">
          Answer options <span className="font-normal text-ink-soft">- tick the correct one</span>
        </legend>
        {LETTERS.map((letter, i) => {
          const selected = correct === i;
          return (
            <div key={letter} className="flex items-start gap-3">
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={`Mark option ${letter} as correct`}
                onClick={() => setValue(`questions.${index}.correctIndex`, i, { shouldDirty: true })}
                className={cn(
                  "mt-1.5 grid size-8 shrink-0 place-items-center rounded-full border text-xs font-semibold transition-colors",
                  selected ? "border-mark bg-mark text-white" : "border-ink/40 text-ink-soft hover:border-ink",
                )}
              >
                {letter}
              </button>
              <div className="flex-1">
                <FormInput
                  label={`Option ${letter}`}
                  className="h-10"
                  error={errors?.options?.[i]?.text?.message}
                  {...register(`questions.${index}.options.${i}.text`)}
                />
              </div>
            </div>
          );
        })}
      </fieldset>
    </section>
  );
}
