import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "pencil";
type Size = "sm" | "md" | "lg";

/*
 * Buttons sit on a solid bottom edge and sink into it when pressed, so a
 * click feels like pressing a key rather than tapping glass.
 */
const variants: Record<Variant, string> = {
  primary:
    "bg-ink text-white shadow-[0_3px_0_0_#0b1030] hover:bg-ink-2 active:translate-y-[3px] active:shadow-[0_0_0_0_#0b1030] disabled:bg-ink/35 disabled:shadow-none",
  pencil:
    "bg-pencil text-ink shadow-[0_3px_0_0_var(--color-pencil-deep)] hover:bg-[#ffd25c] active:translate-y-[3px] active:shadow-none disabled:opacity-50 disabled:shadow-none",
  secondary:
    "bg-paper text-ink border border-line shadow-[0_2px_0_0_var(--color-line)] hover:border-ink/30 hover:shadow-[0_2px_0_0_rgba(25,33,74,0.25)] active:translate-y-[2px] active:shadow-none disabled:text-ink/40",
  ghost: "text-ink-soft hover:bg-ink/[0.06] hover:text-ink",
  danger:
    "bg-redpen text-white shadow-[0_3px_0_0_#9e2219] hover:bg-[#ea4a3f] active:translate-y-[3px] active:shadow-none",
};
const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm rounded-lg",
  md: "h-10 px-4 text-sm rounded-[10px]",
  lg: "h-12 px-6 text-base rounded-xl",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cn(
        "inline-flex select-none items-center justify-center gap-2 font-semibold transition-[background-color,box-shadow,transform,border-color,color] duration-150 disabled:cursor-not-allowed disabled:active:translate-y-0",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
