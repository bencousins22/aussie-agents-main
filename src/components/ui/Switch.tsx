import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  size?: "sm" | "md" | "lg";
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, checked, onCheckedChange, size = "md", disabled, ...props }, ref) => {
    const sizeStyles = {
      sm: {
        track: "h-5 w-9",
        thumb: "size-4",
        translate: "translate-x-4",
      },
      md: {
        track: "h-6 w-11",
        thumb: "size-5",
        translate: "translate-x-5",
      },
      lg: {
        track: "h-7 w-14",
        thumb: "size-6",
        translate: "translate-x-7",
      },
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked);
      props.onChange?.(e);
    };

    const switchElement = (
      <label
        className={cn(
          "relative inline-flex items-center cursor-pointer",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <input
          ref={ref}
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          {...props}
        />
        <div
          className={cn(
            "relative rounded-full transition-colors duration-200",
            sizeStyles[size].track,
            checked
              ? "bg-emerald-500"
              : "bg-zinc-700",
            disabled && "opacity-50"
          )}
        >
          <div
            className={cn(
              "absolute top-0.5 left-0.5 bg-white rounded-full transition-transform duration-200",
              sizeStyles[size].thumb,
              checked && sizeStyles[size].translate
            )}
          />
        </div>
      </label>
    );

    if (!label) return switchElement;

    return (
      <div className="flex items-center justify-between gap-3">
        <span className="text-label text-muted-foreground">{label}</span>
        {switchElement}
      </div>
    );
  }
);

Switch.displayName = "Switch";
