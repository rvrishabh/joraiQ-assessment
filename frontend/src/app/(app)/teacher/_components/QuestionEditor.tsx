"use client";

import FormTextArea from "@/components/Form/FormTextArea";
import { fieldClass } from "@/components/Form/FormInput";
import { cn } from "@/lib/utils";
import type { QuizFormValues } from "@/schemas";
import { Check, Trash2 } from "lucide-react";
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
    <section className="ruled sheet animate-rise rounded-2xl py-5 pl-16 pr-5 sm:py-6 sm:pl-[4.75rem] sm:pr-7">
      <span
        aria-hidden
        className="absolute left-0 top-5 w-[3.25rem] text-center font-display text-2xl font-extrabold tabular-nums text-ink/30 max-sm:w-10 max-sm:text-xl sm:top-6"
      >
        {index + 1}
      </span>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold">Question {index + 1}</h2>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove question ${index + 1}`}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:bg-redpen-soft hover:text-redpen"
          >
            <Trash2 className="size-4" aria-hidden /> Remove
          </button>
        )}
      </div>

      <FormTextArea
        label="Question"
        placeholder="What do you want to ask?"
        className="min-h-20"
        error={errors?.prompt?.message}
        {...register(`questions.${index}.prompt`)}
      />

      <fieldset className="mt-5">
        <legend className="mb-2.5 text-sm font-semibold">
          Answer options <span className="font-normal text-ink-soft">(tap a letter to mark the correct one)</span>
        </legend>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {LETTERS.map((letter, i) => {
            const selected = correct === i;
            const err = errors?.options?.[i]?.text?.message;
            return (
              <div key={letter}>
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-xl border-[1.5px] p-1.5 transition-colors focus-within:border-ink",
                    selected ? "border-mark bg-mark-soft" : err ? "border-redpen" : "border-line bg-paper",
                  )}
                >
                  <button
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={`Mark option ${letter} as correct`}
                    onClick={() => setValue(`questions.${index}.correctIndex`, i, { shouldDirty: true })}
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-full border-[1.5px] text-xs font-bold transition-all duration-200",
                      selected ? "scale-110 border-mark bg-mark text-white" : "border-ink/30 text-ink-soft hover:border-ink hover:text-ink",
                    )}
                  >
                    {selected ? <Check className="size-4 animate-pop" strokeWidth={3} aria-hidden /> : letter}
                  </button>
                  <input
                    aria-label={`Option ${letter}`}
                    aria-invalid={!!err}
                    placeholder={`Option ${letter}`}
                    className={cn(fieldClass, "h-9 border-transparent bg-transparent px-1.5 focus:border-transparent focus:shadow-none")}
                    {...register(`questions.${index}.options.${i}.text`)}
                  />
                </div>
                {err && <p className="mt-1 text-xs font-medium text-redpen">{err}</p>}
              </div>
            );
          })}
        </div>
      </fieldset>
    </section>
  );
}
