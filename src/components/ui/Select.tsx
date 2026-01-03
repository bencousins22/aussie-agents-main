import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  options?: Array<{ value: string | number; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, helperText, error, fullWidth = false, options, children, ...props }, ref) => {
    const hasError = Boolean(error);
    const showHelperText = helperText || error;

    const selectElement = (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "appearance-none w-full rounded-lg px-3 py-2 pr-10 text-sm bg-black/30 border text-white outline-none transition-colors cursor-pointer",
            hasError ? "border-red-500/40 focus:border-red-500/60" : "border-zinc-800 focus:border-emerald-400/40",
            className
          )}
          aria-invalid={hasError}
          aria-describedby={showHelperText ? `${props.id || "select"}-helper` : undefined}
          {...props}
        >
          {children ||
            options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-white/40 pointer-events-none" />
      </div>
    );

    if (!label && !showHelperText) {
      return selectElement;
    }

    return (
      <div className={cn("flex flex-col gap-2", fullWidth && "w-full")}>
        {label && (
          <label htmlFor={props.id} className="text-sm font-medium text-white/80">
            {label}
          </label>
        )}

        {selectElement}

        {showHelperText && (
          <p id={`${props.id || "select"}-helper`} className={cn("text-xs", hasError ? "text-red-400" : "text-white/50")}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
