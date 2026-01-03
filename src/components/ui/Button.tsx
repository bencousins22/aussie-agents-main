import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

export type ButtonVariant = 
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "destructive"
  | "success"
  | "warning";

export type ButtonSize = "sm" | "md" | "lg"  | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "button-base inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wider transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50";

    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 hover:border-emerald-500/50 shadow-lg hover:shadow-emerald-500/30",
      secondary:
        "bg-zinc-700 text-white border border-zinc-600 hover:bg-zinc-600 hover:border-zinc-500 shadow-lg",
      ghost:
        "bg-zinc-800/60 text-white/95 border border-zinc-700/80 hover:text-white hover:bg-zinc-700/80 hover:border-zinc-600 shadow-md backdrop-blur-sm",
      outline:
        "bg-zinc-800/70 text-white/95 border border-zinc-600/80 hover:text-white hover:bg-zinc-700 hover:border-zinc-500 shadow-md backdrop-blur-sm",
      destructive:
        "bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 hover:border-red-500/50 hover:shadow-red-500/30",
      success:
        "bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30 hover:border-green-500/50 hover:shadow-green-500/30",
      warning:
        "bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 hover:border-amber-500/50 hover:shadow-amber-500/30",
    };

    const sizeStyles: Record<ButtonSize, string> = {
      sm: "button-sm text-xs px-3 py-1.5 rounded-lg",
      md: "button-md text-sm px-4 py-2 rounded-xl",
      lg: "button-lg text-base px-6 py-3 rounded-xl",
      icon: "size-9 p-0 rounded-full",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0" aria-hidden="true">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0" aria-hidden="true">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
