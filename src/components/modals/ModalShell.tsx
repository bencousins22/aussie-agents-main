import { useEffect, memo } from "react";
import { X } from "lucide-react";
import { Button } from "../ui/Button";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

interface ModalShellProps {
  open: boolean;
  title: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  size?: ModalSize;
  widthClassName?: string; // Deprecated: use size instead
}

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-[var(--spacing-md)]",
  md: "max-w-[var(--spacing-2xl)]",
  lg: "max-w-[var(--spacing-3xl)]",
  xl: "max-w-[var(--spacing-5xl)]",
  full: "max-w-[var(--spacing-7xl)]",
};

/**
 * ModalShell component provides a consistent container for all application modals.
 * It handles backdrops, escape keys, scroll locking, and basic focus management.
 */
export const ModalShell = memo(function ModalShell({
  open,
  title,
  onClose,
  children,
  size = "lg",
  widthClassName,
}: ModalShellProps) {
  // Handle escape key
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Focus trap (basic implementation)
  useEffect(() => {
    if (!open) return;
    
    const modalElement = document.querySelector('[role="dialog"]');
    if (!modalElement) return;
    
    const focusableElements = modalElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };
    
    window.addEventListener("keydown", handleTabKey);
    return () => window.removeEventListener("keydown", handleTabKey);
  }, [open]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  if (!open) return null;

  const widthClass = widthClassName || sizeClasses[size];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-[var(--spacing-4)]"
      onMouseDown={onClose}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        className={`relative w-full ${widthClass} max-h-[85vh] overflow-hidden rounded-[var(--radius-3xl)] border border-border bg-card shadow-2xl backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-300`}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-[var(--spacing-3)] px-[var(--spacing-6)] py-[var(--spacing-4)] border-b border-border bg-muted/30">
          <div id="modal-title" className="text-sm font-black uppercase tracking-widest text-foreground/90">
            {title}
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close modal"
            className="size-8 rounded-[var(--radius-lg)]"
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(85vh-var(--spacing-16))] overflow-auto no-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
});
