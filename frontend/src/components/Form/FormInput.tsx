"use client";

import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useId, useState, type InputHTMLAttributes } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, hint, className, type, ...props }, ref) => {
    const id = useId();
    const [visible, setVisible] = useState(false);
    const isPassword = type === "password";
    return (
      <div className="space-y-1.5">
        <label htmlFor={id} className="text-sm font-medium">
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
              "h-11 w-full rounded-md border bg-paper px-3 text-base outline-none transition-colors placeholder:text-ink-soft/60 focus:border-ink",
              isPassword && "pr-11",
              error ? "border-redpen" : "border-line",
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
              className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-md text-ink-soft transition-colors hover:text-ink"
            >
              {visible ? <EyeOff className="size-4.5" aria-hidden /> : <Eye className="size-4.5" aria-hidden />}
            </button>
          )}
        </div>
        {hint && !error && <p className="text-xs text-ink-soft">{hint}</p>}
        {error && (
          <p id={`${id}-err`} className="text-xs text-redpen">
            {error}
          </p>
        )}
      </div>
    );
  },
);
FormInput.displayName = "FormInput";
export default FormInput;
