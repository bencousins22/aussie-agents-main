import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type BaseInputProps = {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
};

export interface InputProps extends InputHTMLAttributes<HTMLInputElement>, BaseInputProps {
  as?: "input";
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, BaseInputProps {
  as: "textarea";
}

export type CombinedInputProps = InputProps | TextareaProps;

/**
 * Reusable Input and Textarea component styled with design tokens.
 * Supports labels, helper text, error states, and icons.
 */
export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, CombinedInputProps>(
  (props, ref) => {
    const {
      className,
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      fullWidth = false,
      as = "input",
      ...restProps
    } = props;

    const baseStyles =
      "bg-black/30 border text-foreground placeholder:text-foreground/30 outline-none transition-all duration-200";

    const normalStyles =
      "border-border focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5";

    const errorStyles =
      "border-red-500/40 focus:border-red-500/60 focus:ring-4 focus:ring-red-500/5";

    const inputStyles =
      "rounded-[var(--radius-xl)] px-[var(--spacing-3)] py-[var(--spacing-2)] text-sm w-full";

    const textareaStyles =
      "rounded-[var(--radius-xl)] px-[var(--spacing-3)] py-[var(--spacing-2)] text-sm w-full resize-none min-h-[var(--spacing-24)]";

    const hasError = Boolean(error);
    const showHelperText = helperText || error;

    const inputElement = as === "textarea" ? (
      <textarea
        ref={ref as React.Ref<HTMLTextAreaElement>}
        className={cn(
          baseStyles,
          textareaStyles,
          hasError ? errorStyles : normalStyles,
          className
        )}
        aria-invalid={hasError}
        aria-describedby={showHelperText ? `${props.id || 'input'}-helper` : undefined}
        {...(restProps as TextareaHTMLAttributes<HTMLTextAreaElement>)}
      />
    ) : (
      <input
        ref={ref as React.Ref<HTMLInputElement>}
        className={cn(
          baseStyles,
          inputStyles,
          hasError ? errorStyles : normalStyles,
          leftIcon && "pl-[var(--spacing-10)]",
          rightIcon && "pr-[var(--spacing-10)]",
          className
        )}
        aria-invalid={hasError}
        aria-describedby={showHelperText ? `${props.id || 'input'}-helper` : undefined}
        {...(restProps as InputHTMLAttributes<HTMLInputElement>)}
      />
    );

    if (!label && !leftIcon && !rightIcon && !showHelperText) {
      return inputElement;
    }

    return (
      <div className={cn("flex flex-col gap-[var(--spacing-2)]", fullWidth && "w-full")}>
        {label && (
          <label
            htmlFor={props.id}
            className="text-sm font-semibold text-foreground/80"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-[var(--spacing-3)] top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none">
              {leftIcon}
            </div>
          )}

          {inputElement}

          {rightIcon && (
            <div className="absolute right-[var(--spacing-3)] top-1/2 -translate-y-1/2 text-foreground/40">
              {rightIcon}
            </div>
          )}
        </div>

        {showHelperText && (
          <p
            id={`${props.id || 'input'}-helper`}
            className={cn(
              "text-caption",
              hasError ? "text-red-400" : "text-foreground/50"
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
