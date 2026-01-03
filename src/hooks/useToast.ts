import { useState } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 11);
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const success = (message: string, title?: string) => addToast({ type: "success", message, title });
  const error = (message: string, title?: string) => addToast({ type: "error", message, title });
  const warning = (message: string, title?: string) => addToast({ type: "warning", message, title });
  const info = (message: string, title?: string) => addToast({ type: "info", message, title });

  return { toasts, addToast, removeToast, success, error, warning, info };
}
