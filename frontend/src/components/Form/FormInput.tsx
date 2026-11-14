"use client";

import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useId, useState, type InputHTMLAttributes } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const fieldClass =
  "w-full rounded-[10px] border bg-paper text-base outline-none transition-[border-color,box-shadow] placeholder:text-ink-soft/55 focus:border-ink focus:shadow-[0_0_0_4px_rgba(255,201,60,0.45)]";

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, hint, className, type, ...props }, ref) => {
    const id = useId();
    const [visible, setVisible] = useState(false);
    const isPassword = type === "password";
    return (
      <div className="space-y-1.5">
        <label htmlFor={id} className="text-sm font-semibold">
          {label}
        </label>
        <div className="relative">
          <input
            id={id}
            ref={ref}
            type={isPassword && visible ? "text" : type}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-err` : undefined}
            className={cn(
              fieldClass,
              "h-11 px-3.5",
              isPassword && "pr-11",
              error ? "border-redpen focus:shadow-[0_0_0_4px_rgba(224,58,47,0.15)]" : "border-line",
              className,
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              aria-label={visible ? "Hide password" : "Show password"}
              aria-pressed={visible}
              className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-[10px] text-ink-soft transition-colors hover:text-ink"
            >
              {visible ? <EyeOff className="size-4.5" aria-hidden /> : <Eye className="size-4.5" aria-hidden />}
            </button>
          )}
        </div>
        {hint && !error && <p className="text-xs text-ink-soft">{hint}</p>}
        {error && (
          <p id={`${id}-err`} className="animate-rise text-xs font-medium text-redpen">
            {error}
          </p>
        )}
      </div>
    );
  },
);
FormInput.displayName = "FormInput";
export default FormInput;
