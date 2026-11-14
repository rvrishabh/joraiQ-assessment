import { cn } from "@/lib/utils";
import { forwardRef, useId, type TextareaHTMLAttributes } from "react";
import { fieldClass } from "./FormInput";

interface FormTextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

const FormTextArea = forwardRef<HTMLTextAreaElement, FormTextAreaProps>(
  ({ label, error, className, ...props }, ref) => {
    const id = useId();
    return (
      <div className="space-y-1.5">
        <label htmlFor={id} className="text-sm font-semibold">
          {label}
        </label>
        <textarea
          id={id}
          ref={ref}
          aria-invalid={!!error}
          className={cn(
            fieldClass,
            "min-h-24 px-3.5 py-2.5",
            error ? "border-redpen" : "border-line",
            className,
          )}
          {...props}
        />
        {error && <p className="animate-rise text-xs font-medium text-redpen">{error}</p>}
      </div>
    );
  },
);
FormTextArea.displayName = "FormTextArea";
export default FormTextArea;
