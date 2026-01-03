import { useState, useEffect, memo, useCallback } from "react";
import { ChevronDown, ChevronUp, Maximize2, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "../../lib/utils";
import type { AgentLogEntry } from "../../lib/types";
import { Button } from "../ui/Button";
import { CodeBlock } from "../features/CodeBlock";

interface ResponseBlockProps {
  log: AgentLogEntry;
}

interface MarkdownCodeProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const ResponseBlock = memo(function ResponseBlock({ log }: ResponseBlockProps) {
  const [expanded, setExpanded] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Handle escape key to close fullscreen
  useEffect(() => {
    if (!fullscreen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [fullscreen]);

  const heading = log.heading || "Aussie Agents: Response";
  const content = (log.content || "").trim();
  const isResponse = log.type === "response";
  const timestamp = log.receivedAt
    ? new Date(log.receivedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  // Copy content to clipboard
  const handleCopy = useCallback(async (text?: string) => {
    try {
      await navigator.clipboard.writeText(text || content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [content]);

  const toggleExpanded = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  }, [expanded]);

  const openFullscreen = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setFullscreen(true);
  }, []);

  // Don't render empty or placeholder content
  const isEmpty = !content || content === "[]" || content === "{}" || content === "null";
  if (isEmpty && !heading) return null;

  return (
    <>
      {/* Fullscreen Modal */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
          onMouseDown={() => setFullscreen(false)}
          onClick={() => setFullscreen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-heading"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />

          {/* Modal */}
          <div
            className="relative w-full max-w-5xl h-[90vh] bg-zinc-900 rounded-2xl border border-zinc-700 shadow-2xl flex flex-col overflow-hidden"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-700 bg-zinc-800/50">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "size-8 rounded-lg grid place-items-center text-xs font-bold border",
                    isResponse
                      ? "bg-zinc-800 border-zinc-700 text-emerald-400"
                      : "bg-emerald-900/50 border-emerald-700/50 text-emerald-400"
                  )}
                  aria-hidden="true"
                >
                  AA
                </div>
                <span id="modal-heading" className="font-semibold text-white">
                  {heading}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy()}
                  loading={false}
                >
                  {copied ? "Copied" : "Copy"}
                </Button>
                
                <Button variant="ghost" size="icon" onClick={() => setFullscreen(false)} title="Close">
                  <X className="size-5" />
                </Button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6">
              <div className="prose prose-invert prose-lg max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ inline, className, children, ...props }: MarkdownCodeProps) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <CodeBlock language={match[1]}>{String(children).replace(/\n$/, "")}</CodeBlock>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Normal Card View */}
      <div
        className={cn(
          "rounded-[var(--radius-3xl)] overflow-hidden border transition-all duration-500 mb-8 group",
          isResponse
            ? "bg-zinc-900/40 border-zinc-800/60 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)]"
            : "bg-emerald-950/10 border-emerald-900/30 shadow-[0_20px_50px_-20px_rgba(5,150,105,0.1)]"
        )}
        role="article"
        aria-label="Agent response"
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center justify-between px-6 py-4 cursor-pointer select-none transition-colors",
            isResponse ? "hover:bg-zinc-800/40" : "hover:bg-emerald-900/20"
          )}
          onClick={toggleExpanded}
        >
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "size-9 rounded-2xl grid place-items-center text-[11px] font-black border transition-all duration-300",
                isResponse
                  ? "bg-zinc-800 border-zinc-700/50 text-emerald-400 shadow-inner group-hover:border-emerald-500/30"
                  : "bg-emerald-900/50 border-emerald-700/50 text-emerald-400 group-hover:scale-105"
              )}
              aria-hidden="true"
            >
              AA
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-0.5">
                <span className="text-caption text-white/40">Aussie Agents</span>
                {timestamp && <span className="text-[10px] text-white/20 font-medium">{timestamp}</span>}
              </div>
              <span className="font-bold text-md tracking-tight text-white/95">{heading}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {content && !isEmpty && (
              <Button
                variant="ghost"
                size="icon"
                onClick={openFullscreen}
                title="Fullscreen View"
              >
                <Maximize2 className="size-4.5" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleExpanded}
              aria-expanded={expanded}
              aria-label={expanded ? "Collapse response" : "Expand response"}
            >
              {expanded ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
            </Button>
          </div>
        </div>

        {/* Content */}
        {expanded && content && !isEmpty && (
          <div
            className={cn(
              "px-7 py-6 border-t animate-in fade-in slide-in-from-top-2 duration-300",
              isResponse ? "border-zinc-800/60" : "border-emerald-900/30"
            )}
          >
            <div className="prose prose-invert prose-emerald max-w-none prose-p:leading-[1.8] prose-headings:tracking-tight prose-pre:bg-transparent prose-pre:p-0 prose-sm md:prose-base text-white/90">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ inline, className, children, ...props }: MarkdownCodeProps) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <CodeBlock language={match[1]}>{String(children).replace(/\n$/, "")}</CodeBlock>
                    ) : (
                      <code
                        className={cn("bg-black/40 px-1.5 py-0.5 rounded text-emerald-400 font-mono text-[0.9em]", className)}
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </>
  );
});
