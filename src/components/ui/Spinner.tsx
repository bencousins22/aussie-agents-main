import { forwardRef, type HTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

export type SpinnerSize = "sm" | "md" | "lg" | "xl";
export type SpinnerVariant = "default" | "primary" | "white";

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  label?: string;
}

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  (
    {
      className,
      size = "md",
      variant = "default",
      label,
      ...props
    },
    ref
  ) => {
    const sizeStyles: Record<SpinnerSize, string> = {
      sm: "size-4",
      md: "size-6",
      lg: "size-8",
      xl: "size-12",
    };

    const variantStyles: Record<SpinnerVariant, string> = {
      default: "text-white/60",
      primary: "text-emerald-400",
      white: "text-white",
    };

    return (
      <div
        ref={ref}
        className={cn("inline-flex flex-col items-center gap-2", className)}
        role="status"
        {...props}
      >
        <Loader2
          className={cn(
            "animate-spin",
            sizeStyles[size],
            variantStyles[variant]
          )}
          aria-hidden="true"
        />
        {label && (
          <span className="text-xs text-white/40 font-medium">{label}</span>
        )}
        <span className="sr-only">{label || "Loading..."}</span>
      </div>
    );
  }
);

Spinner.displayName = "Spinner";
