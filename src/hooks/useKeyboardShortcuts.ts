import { useEffect, useCallback } from "react";

export function useKeyboardShortcuts({
  onSearch,
  onCloseModals,
  onToggleSidebar,
  onNewChat,
  onSettings,
  onFocusInput,
  onTogglePause,
  onShowHelp,
  onClearChat,
}: {
  onSearch?: () => void;
  onCloseModals?: () => void;
  onToggleSidebar?: () => void;
  onNewChat?: () => void;
  onSettings?: () => void;
  onFocusInput?: () => void;
  onTogglePause?: () => void;
  onShowHelp?: () => void;
  onClearChat?: () => void;
}) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore if typing in input (except for specific shortcuts)
    const target = e.target as HTMLElement;
    const isTyping = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.contentEditable === "true";

    const isMod = e.metaKey || e.ctrlKey;
    const isShift = e.shiftKey;

    // ? : Help
    if (e.key === "?" && !isTyping) {
      e.preventDefault();
      onShowHelp?.();
    }

    // Ctrl/Cmd + Enter: Focus input (if not already focused)
    if (isMod && e.key === "Enter" && !isTyping) {
      e.preventDefault();
      onFocusInput?.();
    }

    if (isTyping) {
      // Allow Escape to blur input
      if (e.key === "Escape") {
        target.blur();
        onCloseModals?.();
      }
      return;
    }

    // Ctrl/Cmd + K: Search
    if (isMod && e.key === "k") {
      e.preventDefault();
      onSearch?.();
    }

    // Ctrl/Cmd + Space: Toggle Pause
    if (isMod && e.key === " ") {
      e.preventDefault();
      onTogglePause?.();
    }

    // Escape: Close modals
    if (e.key === "Escape") {
      onCloseModals?.();
    }

    // Ctrl/Cmd + B: Toggle sidebar
    if (isMod && e.key === "b") {
      e.preventDefault();
      onToggleSidebar?.();
    }

    // Ctrl/Cmd + N: New chat
    if (isMod && e.key === "n") {
      e.preventDefault();
      onNewChat?.();
    }

    // Ctrl/Cmd + ,: Settings
    if (isMod && e.key === ",") {
      e.preventDefault();
      onSettings?.();
    }

    // Ctrl/Cmd + Shift + C: Clear chat
    if (isMod && isShift && e.key === "C") {
      e.preventDefault();
      onClearChat?.();
    }
  }, [onSearch, onCloseModals, onToggleSidebar, onNewChat, onSettings, onFocusInput, onTogglePause, onShowHelp, onClearChat]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}