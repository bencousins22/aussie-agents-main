import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "outline";

export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "sm", dot = false, children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-1.5 font-bold uppercase tracking-wider rounded-full transition-colors";

    const variantStyles: Record<BadgeVariant, string> = {
      default:
        "bg-zinc-800 text-white/80 border border-zinc-700",
      primary:
        "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
      success:
        "bg-green-500/20 text-green-400 border border-green-500/30",
      warning:
        "bg-amber-500/20 text-amber-300 border border-amber-500/30",
      error:
        "bg-red-500/20 text-red-400 border border-red-500/30",
      info:
        "bg-blue-500/20 text-blue-400 border border-blue-500/30",
      outline:
        "bg-transparent text-white/70 border border-zinc-700",
    };

    const sizeStyles: Record<BadgeSize, string> = {
      sm: "text-xs px-2 py-0.5",
      md: "text-sm px-3 py-1",
      lg: "text-base px-4 py-1.5",
    };

    const dotColors: Record<BadgeVariant, string> = {
      default: "bg-white/80",
      primary: "bg-emerald-400",
      success: "bg-green-400",
      warning: "bg-amber-400",
      error: "bg-red-400",
      info: "bg-blue-400",
      outline: "bg-white/70",
    };

    return (
      <span
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn("size-1.5 rounded-full", dotColors[variant])}
            aria-hidden="true"
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
