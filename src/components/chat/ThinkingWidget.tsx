import { useMemo, useState, memo, useTransition } from "react";
import { ChevronDown, ChevronRight, Sparkles, Database, BrainCircuit } from "lucide-react";
import { cn } from "../../lib/utils";
import type { AgentLogEntry } from "../../lib/types";
import { Badge } from "../ui/Badge";
import { CodeBlock } from "../features/CodeBlock";

function stripIconPrefix(s: string) {
  return s.replace(/^icon:\/\/\S+\s*/i, "").trim();
}

/**
 * ThinkingWidget component displays the agent's internal reasoning process.
 * It uses a purple-themed design to distinguish "thoughts" from "actions".
 */
export const ThinkingWidget = memo(function ThinkingWidget({ log }: { log: AgentLogEntry }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const heading = useMemo(() => stripIconPrefix(log.heading || ""), [log.heading]);
  const content = (log.content || "").trim();

  const hasDetails = content.length > 0 || (log.kvps && Object.keys(log.kvps).length > 0);

  const kvpsText = useMemo(() => {
    if (!log.kvps || typeof log.kvps !== "object") return "";
    try {
      return JSON.stringify(log.kvps, null, 2);
    } catch {
      return String(log.kvps);
    }
  }, [log.kvps]);

  const toggleOpen = () => {
    if (hasDetails) {
      startTransition(() => {
        setOpen((v) => !v);
      });
    }
  };

  return (
    <div className="w-full mb-[var(--spacing-4)] group/thought animate-in fade-in slide-in-from-left-4 duration-500">
      <button
        type="button"
        className={cn(
          "w-full text-left",
          "flex items-center gap-[var(--spacing-4)] p-[var(--spacing-4)] rounded-[var(--radius-2xl)] transition-all duration-300",
          "bg-zinc-900/40 border border-zinc-800/60 hover:bg-zinc-800/50 hover:border-purple-500/20 shadow-lg",
          hasDetails ? "cursor-pointer" : "cursor-default"
        )}
        onClick={toggleOpen}
        aria-expanded={open}
        disabled={isPending}
      >
        <div className="size-8 grid place-items-center rounded-[var(--radius-xl)] bg-purple-500/10 border border-purple-500/20">
          <Sparkles className="size-4 text-purple-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-caption text-white/40 mb-[var(--spacing-1)] flex items-center gap-[var(--spacing-2)]">
            <BrainCircuit className="size-3" />
            <span className="uppercase tracking-wider font-semibold">Agent Reasoning</span>
          </div>
          <div className="text-sm font-bold text-white/90 truncate">
            {heading || "Processing Thought..."}
          </div>
        </div>

        {hasDetails && (
          <div className="flex items-center gap-[var(--spacing-3)]">
            <Badge variant="secondary" size="sm">
              Details
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
          {content && (
            <div className="px-[var(--spacing-5)] py-[var(--spacing-4)]">
              <div className="text-caption text-white/30 mb-[var(--spacing-2)] flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-purple-500/40" />
                Inner Monologue
              </div>
              <CodeBlock language="markdown" className="my-0 bg-purple-500/5 border-purple-500/10 italic">
                {content}
              </CodeBlock>
            </div>
          )}

          {kvpsText && (
            <div className={cn(
              "px-[var(--spacing-5)] py-[var(--spacing-4)]", 
              content ? "border-t border-zinc-800/60" : ""
            )}>
              <div className="text-caption text-white/30 mb-[var(--spacing-2)] flex items-center gap-2">
                <Database className="size-3 text-white/20" />
                Step Metadata
              </div>
              <CodeBlock language="json" className="my-0 bg-black/30 border-white/5">
                {kvpsText}
              </CodeBlock>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
