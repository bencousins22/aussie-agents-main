import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export type CardVariant = "default" | "glass" | "bordered" | "elevated";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  interactive?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = "default",
      interactive = false,
      padding = "md",
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "rounded-xl overflow-hidden";

    const variantStyles: Record<CardVariant, string> = {
      default:
        "bg-zinc-900/20 border border-zinc-800",
      glass:
        "bg-black/20 border border-white/10 backdrop-blur-md",
      bordered:
        "bg-black/40 border border-zinc-800/60",
      elevated:
        "bg-zinc-900/40 border border-zinc-800/50 shadow-2xl",
    };

    const paddingStyles: Record<typeof padding, string> = {
      none: "",
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
    };

    const interactiveStyles = interactive
      ? "transition-all duration-300 cursor-pointer hover:border-emerald-500/20 hover:bg-opacity-30 active:scale-[0.98]"
      : "";

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          paddingStyles[padding],
          interactiveStyles,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  divider?: boolean;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, divider = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "px-4 py-3",
          divider && "border-b border-zinc-800",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = "CardHeader";

export const CardBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("p-4", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardBody.displayName = "CardBody";

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("px-4 py-3 border-t border-zinc-800", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = "CardFooter";
