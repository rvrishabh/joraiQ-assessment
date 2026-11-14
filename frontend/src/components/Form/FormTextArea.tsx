import { cn } from "@/lib/utils";
import { forwardRef, useId, type TextareaHTMLAttributes } from "react";

interface FormTextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

const FormTextArea = forwardRef<HTMLTextAreaElement, FormTextAreaProps>(
  ({ label, error, className, ...props }, ref) => {
    const id = useId();
    return (
      <div className="space-y-1.5">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <textarea
          id={id}
          ref={ref}
          aria-invalid={!!error}
          className={cn(
            "min-h-24 w-full rounded-md border bg-paper px-3 py-2.5 text-base outline-none transition-colors placeholder:text-ink-soft/60 focus:border-ink",
            error ? "border-redpen" : "border-line",
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-redpen">{error}</p>}
      </div>
    );
  },
);
FormTextArea.displayName = "FormTextArea";
export default FormTextArea;
