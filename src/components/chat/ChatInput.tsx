import { useRef, useState, useCallback, useEffect, useActionState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import {
  Paperclip,
  Send,
  Maximize2,
  X,
  Pause,
  Play,
  FileText,
  FolderOpen,
  History,
  MessageSquare,
  ArrowRight,
  FolderTree,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { agentZeroApi } from "../../lib/agentZeroApi";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { useDragDrop } from "../../hooks/useDragDrop";

interface ChatInputProps {
  onSubmit: (text: string, files: File[]) => void;
  disabled?: boolean;
  statusText?: string;
  activeContext: string | null;
  paused: boolean;
  onPauseToggle: () => void;
  isPausing: boolean;
  onOpenFiles: () => void;
  onOpenHistory: () => void;
  onOpenContext: () => void;
  onOpenProjects: () => void;
  connected?: boolean;
}

export function ChatInput({
  onSubmit,
  disabled,
  statusText,
  activeContext,
  paused,
  onPauseToggle,
  isPausing,
  onOpenFiles,
  onOpenHistory,
  onOpenContext,
  onOpenProjects,
  connected = true,
}: ChatInputProps) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag-drop functionality using custom hook
  const { isDragging, dragHandlers } = useDragDrop({
    onDrop: (droppedFiles) => {
      startTransition(() => {
        setFiles((prev) => [...prev, ...droppedFiles]);
      });
    },
    maxFiles: 20,
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  // Debounced textarea resize
  const resizeTimeoutRef = useRef<number | null>(null);
  const handleResize = useCallback(() => {
    if (inputRef.current) {
      // Clear any pending resize
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      
      // Debounce the resize operation
      resizeTimeoutRef.current = window.setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.style.height = "auto";
          inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 250)}px`;
        }
      }, 16); // ~60fps
    }
  }, []);

  // Auto-resize textarea with debouncing
  useEffect(() => {
    handleResize();
    
    return () => {
      if (resizeTimeoutRef.current) {
        window.clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [text, handleResize]);

  // React 19 Form Action with optimized submission
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_state, formAction] = useActionState(async (prevState: unknown, formData: FormData) => {
    if (disabled) return prevState;
    
    const message = formData.get("message") as string;
    const messageText = message?.trim() || "";
    
    if (!messageText && files.length === 0) return prevState;
    
    try {
      // Use startTransition to defer state updates
      startTransition(() => {
        onSubmit(messageText, files);
        setText("");
        setFiles([]);
      });
    } catch (error) {
      console.error("Submission failed:", error);
    }
    
    return null;
  }, null);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  }, []);

  const handleNudge = useCallback(async () => {
    if (!activeContext || disabled) return;
    try {
      await agentZeroApi.nudge(activeContext);
    } catch (e) {
      console.error("Failed to nudge:", e);
    }
  }, [activeContext, disabled]);

  const handleImportKnowledge = useCallback(() => {
    if (disabled) return;
    
    startTransition(() => {
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = true;
      input.onchange = async (e) => {
        const filesInput = (e.target as HTMLInputElement).files;
        if (!filesInput?.length) return;
        
        // Use setTimeout to defer the expensive operation
        setTimeout(async () => {
          try {
            await agentZeroApi.uploadWorkDirFiles({
              path: "/knowledge",
              files: Array.from(filesInput),
            });
          } catch (e) {
            console.error("Failed to import knowledge:", e);
          }
        }, 0);
      };
      input.click();
    });
  }, [disabled]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      startTransition(() => {
        setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
      });
    }
  }, []);

  const removeFile = useCallback((index: number) => {
    startTransition(() => {
      setFiles((prev) => prev.filter((_, idx) => idx !== index));
    });
  }, []);

  return (
    <div
      className={cn(
        "w-full max-w-4xl mx-auto p-2 sm:p-6 bg-gradient-to-t from-black via-black/80 to-transparent transition-all duration-300",
        disabled && "opacity-50 pointer-events-none grayscale-[0.5]"
      )}
      role="region"
      aria-label="Chat input and commands"
      {...dragHandlers}
    >
      <div className="flex flex-col gap-3 sm:gap-4 relative">
        {/* Drag Overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-50 bg-emerald-500/10 border-2 border-dashed border-emerald-500/40 rounded-2xl sm:rounded-[var(--radius-4xl)] backdrop-blur-sm flex items-center justify-center pointer-events-none animate-in fade-in duration-200">
            <div className="flex flex-col items-center gap-2 text-emerald-400">
              <FolderTree className="size-8 sm:size-10" />
              <span className="text-xs sm:text-sm">Drop files to attach</span>
            </div>
          </div>
        )}

        {/* Status & Quick Actions */}
        <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2 px-1">
          {statusText ? (
            <StatusIndicator statusText={statusText} />
          ) : (
            <div
              className="hidden sm:flex items-center gap-2.5 text-white/30 text-caption px-4 animate-in fade-in duration-500"
              role="status"
            >
              <div className="size-1.5 rounded-full bg-white/10" aria-hidden="true" />
              <span>{connected ? "Ready" : "Backend Offline"}</span>
            </div>
          )}

          <div
            className="flex items-center gap-1 sm:gap-2 bg-zinc-800/80 backdrop-blur-md p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border border-zinc-700/80 shadow-xl"
            role="toolbar"
            aria-label="Agent commands"
          >
            <Button
              size="icon"
              variant={paused ? "primary" : "warning"}
              onClick={onPauseToggle}
              disabled={disabled || !activeContext || isPausing}
              title={paused ? "Resume" : "Pause"}
              className="size-8 sm:size-10"
            >
              {paused ? <Play className="size-4 sm:size-5" /> : <Pause className="size-4 sm:size-5" />}
            </Button>

            <div className="w-px h-5 sm:h-6 bg-zinc-700/60" aria-hidden="true" />

            <Button size="icon" variant="outline" onClick={handleImportKnowledge} disabled={disabled} title="Import Knowledge" className="size-8 sm:size-10 hidden sm:flex">
              <FileText className="size-4 sm:size-5" />
            </Button>
            <Button size="icon" variant="outline" onClick={onOpenFiles} disabled={disabled} title="Files" className="size-8 sm:size-10">
              <FolderOpen className="size-4 sm:size-5" />
            </Button>
            <Button size="icon" variant="outline" onClick={onOpenHistory} disabled={disabled} title="History" className="size-8 sm:size-10">
              <History className="size-4 sm:size-5" />
            </Button>
            <Button size="icon" variant="outline" onClick={onOpenContext} disabled={disabled} title="Context" className="size-8 sm:size-10 hidden sm:flex">
              <MessageSquare className="size-4 sm:size-5" />
            </Button>
            <Button size="icon" variant="outline" onClick={onOpenProjects} disabled={disabled} title="Projects" className="size-8 sm:size-10">
              <FolderTree className="size-4 sm:size-5" />
            </Button>

            <div className="w-px h-5 sm:h-6 bg-zinc-700/60" aria-hidden="true" />

            <Button
              size="icon"
              variant="success"
              onClick={handleNudge}
              disabled={disabled || !activeContext}
              title="Nudge Agent"
              className="size-8 sm:size-10"
            >
              <ArrowRight className="size-4 sm:size-5" />
            </Button>
          </div>
        </div>

        {/* Main Input Form */}
        <form action={formAction} className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 rounded-2xl sm:rounded-[var(--radius-4xl)] blur-xl opacity-0 group-focus-within:opacity-100 transition duration-700" />
          
          <div className="relative flex flex-col bg-zinc-900/90 border border-zinc-800/80 rounded-2xl sm:rounded-[var(--radius-3xl)] shadow-3xl backdrop-blur-3xl overflow-hidden focus-within:border-emerald-500/40 focus-within:bg-zinc-900 transition-all duration-500">
            {/* File Previews */}
            {files.length > 0 && (
              <div
                className="flex flex-wrap gap-2 p-3 sm:p-5 border-b border-zinc-800/50 bg-black/40"
                aria-label="Attached files"
              >
                {files.map((file, i) => (
                  <FilePreview key={i} file={file} onRemove={() => removeFile(i)} />
                ))}
              </div>
            )}

            <div className="flex items-end gap-2 sm:gap-3 p-2 sm:p-4">
              {/* Attach Files Button */}
              <label
                className={cn(
                  "size-10 sm:size-12 grid place-items-center rounded-xl sm:rounded-2xl text-white/60 hover:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer transition-all active:scale-90 flex-shrink-0",
                  disabled && "cursor-not-allowed opacity-50"
                )}
                aria-label="Attach files"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="sr-only"
                  onChange={handleFileChange}
                  disabled={disabled}
                />
                <Paperclip className="size-5 sm:size-5.5 rotate-45" aria-hidden="true" />
              </label>

              {/* Textarea */}
              <textarea
                ref={inputRef}
                name="message"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Send a message..."
                rows={1}
                disabled={disabled}
                aria-label="Message Aussie Agents"
                className="flex-1 bg-transparent text-white placeholder:text-white/20 outline-none resize-none text-base sm:text-[16px] leading-relaxed min-h-[40px] sm:min-h-[48px] max-h-[250px] py-2.5 sm:py-3.5 px-1 font-medium"
              />

              {/* Action Buttons */}
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  type="button"
                  disabled={disabled || isPending}
                  aria-label="Full screen input"
                  className="size-9 sm:size-11 grid place-items-center rounded-xl sm:rounded-2xl text-white/40 hover:text-white hover:bg-zinc-800/80 transition-all active:scale-90 disabled:opacity-50"
                >
                  <Maximize2 className="size-4 sm:size-5" aria-hidden="true" />
                </button>
                
                <SubmitButton disabled={disabled || (!text.trim() && files.length === 0) || isPending} />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center hidden sm:block">
          <p className="text-caption text-white/20 select-none italic tracking-ultra">
            Aussie Agents Workforce • Precision Intelligence • v1.0
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function StatusIndicator({ statusText }: { statusText: string }) {
  const getStatusVariant = (): "error" | "warning" | "info" | "success" | "primary" => {
    if (statusText.includes("🔴")) return "error";
    if (statusText.includes("⏸️")) return "warning";
    if (statusText.includes("⏳")) return "info";
    if (statusText.includes("🔄")) return "primary";
    if (statusText.includes("✅")) return "success";
    return "default" as "primary";
  };

  const hasProgress = statusText.includes("🔄");
  const progressMatch = statusText.match(/(\d+)%/);
  const progressValue = progressMatch ? Math.max(10, parseInt(progressMatch[1])) : 100;

  return (
    <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <Badge variant={getStatusVariant()} size="md" dot>
        {statusText}
      </Badge>

      {hasProgress && (
        <div className="w-full h-1.5 bg-zinc-800/50 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(52,211,153,0.4)]"
            style={{
              width: `${progressValue}%`,
              boxShadow: "0 0 12px rgba(52, 211, 153, 0.6)",
            }}
          />
        </div>
      )}
    </div>
  );
}

function FilePreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-2 bg-zinc-800/80 px-3.5 py-2 rounded-xl border border-emerald-500/10 text-xs text-white/90 pr-2 group/file shadow-inner">
      <span className="truncate max-w-[180px] font-semibold">{file.name}</span>
      <button
        type="button"
        onClick={onRemove}
        className="size-5.5 grid place-items-center rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-all"
        aria-label={`Remove ${file.name}`}
      >
        <X className="size-3" />
      </button>
    </div>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      aria-label="Send message"
      className={cn(
        "size-12 grid place-items-center rounded-[var(--radius-xl)] transition-all flex-shrink-0 shadow-2xl",
        disabled || pending
          ? "bg-zinc-800 text-white/10 cursor-not-allowed"
          : "bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 shadow-emerald-500/20"
      )}
    >
      <Send className="size-5.5 fill-current" aria-hidden="true" />
    </button>
  );
}
