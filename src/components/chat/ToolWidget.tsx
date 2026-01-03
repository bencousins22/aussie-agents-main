import { useMemo, useState, memo, useTransition } from "react";
import { CheckCircle2, ChevronDown, ChevronRight, Loader2, Terminal } from "lucide-react";
import { cn } from "../../lib/utils";
import type { AgentLogEntry } from "../../lib/types";
import { Badge } from "../ui/Badge";
import { CodeBlock } from "../features/CodeBlock";

function stripIconPrefix(s: string) {
  return s.replace(/^icon:\/\/\S+\s*/i, "").trim();
}

function parseToolNameFromHeading(heading: string): string {
  const m = heading.match(/Using tool '([^']+)'/i);
  if (m?.[1]) return m[1];
  return heading;
}

/**
 * ToolWidget component displays the execution status and output of agent tools.
 * It features a collapsible interface to show/hide tool arguments and results.
 */
export const ToolWidget = memo(function ToolWidget({ log }: { log: AgentLogEntry }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const heading = useMemo(() => stripIconPrefix(log.heading || ""), [log.heading]);
  const toolName = useMemo(() => parseToolNameFromHeading(heading), [heading]);

  const output = (log.content || "").trim();
  const isRunning = output.length === 0;

  const argsText = useMemo(() => {
    if (!log.kvps || typeof log.kvps !== "object") return "";
    try {
      return JSON.stringify(log.kvps, null, 2);
    } catch {
      return String(log.kvps);
    }
  }, [log.kvps]);

  const toggleOpen = () => {
    if (!isRunning) {
      startTransition(() => {
        setOpen((v) => !v);
      });
    }
  };

  return (
    <div className="w-full mb-[var(--spacing-4)] group/tool animate-in fade-in slide-in-from-left-4 duration-500">
      <button
        type="button"
        className={cn(
          "w-full text-left",
          "flex items-center gap-[var(--spacing-4)] p-[var(--spacing-4)] rounded-[var(--radius-2xl)] border transition-all duration-300",
          isRunning
            ? "bg-amber-500/5 border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.05)]"
            : "bg-zinc-900/40 border-zinc-800/60 hover:bg-zinc-800/50 hover:border-emerald-500/20 shadow-lg",
          !isRunning && "cursor-pointer"
        )}
        onClick={toggleOpen}
        aria-expanded={open}
        disabled={isPending}
      >
        <div className="relative flex items-center justify-center size-8 rounded-[var(--radius-xl)] bg-black/40 border border-white/5">
          {isRunning ? (
            <Loader2 className="animate-spin text-amber-400 size-4" />
          ) : (
            <CheckCircle2 className="text-emerald-400 size-4" />
          )}
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="text-caption text-white/40 flex items-center gap-[var(--spacing-2)] mb-[var(--spacing-1)]">
            <Terminal className="size-3" />
            <span className="truncate uppercase tracking-wider font-semibold">{toolName}</span>
          </div>
          <div className="text-sm font-bold text-white/90">
            {isRunning ? (
              <span className="flex items-center gap-[var(--spacing-2)]">
                Running Tool
                <span className="flex gap-1">
                  <span className="animate-bounce delay-0">.</span>
                  <span className="animate-bounce delay-100">.</span>
                  <span className="animate-bounce delay-200">.</span>
                </span>
              </span>
            ) : (
              "Execution Complete"
            )}
          </div>
        </div>

        {!isRunning && (
          <div className="flex items-center gap-[var(--spacing-3)]">
            <Badge variant={isRunning ? "warning" : "success"} size="sm" dot>
              {isRunning ? "Active" : "Done"}
            </Badge>
            <div className="text-white/40">
              {open ? (
                <ChevronDown className="size-5 transition-transform duration-300" />
              ) : (
                <ChevronRight className="size-5 transition-transform duration-300" />
              )}
            </div>
          </div>
        )}
      </button>

      {open && (
        <div className="mt-[var(--spacing-3)] overflow-hidden rounded-[var(--radius-2xl)] border border-zinc-800/60 bg-black/40 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-300">
          {argsText && (
            <div className="px-[var(--spacing-5)] py-[var(--spacing-4)] border-b border-zinc-800/60">
              <div className="text-caption text-white/30 mb-[var(--spacing-2)] flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-blue-500/40" />
                Input Arguments
              </div>
              <CodeBlock language="json" className="my-0 bg-black/30 border-white/5">
                {argsText}
              </CodeBlock>
            </div>
          )}

          <div className="px-[var(--spacing-5)] py-[var(--spacing-4)]">
            <div className="text-caption text-white/30 mb-[var(--spacing-2)] flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-emerald-500/40" />
              Terminal Output
            </div>
            {output ? (
              <CodeBlock language="bash" className="my-0 bg-black/30 border-emerald-500/10 shadow-inner">
                {output}
              </CodeBlock>
            ) : (
              <div className="text-xs text-white/20 italic p-[var(--spacing-3)] bg-black/20 rounded-[var(--radius-lg)] border border-white/5">
                (no output)
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});
