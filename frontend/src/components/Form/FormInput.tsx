import { cn } from "@/lib/utils";
import { forwardRef, useId, type InputHTMLAttributes } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, hint, className, ...props }, ref) => {
    const id = useId();
    return (
      <div className="space-y-1.5">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <input
          id={id}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : undefined}
          className={cn(
            "h-11 w-full rounded-md border bg-paper px-3 text-base outline-none transition-colors placeholder:text-ink-soft/60 focus:border-ink",
            error ? "border-redpen" : "border-line",
            className,
          )}
          {...props}
        />
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
