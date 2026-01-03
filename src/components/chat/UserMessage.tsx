import { memo } from "react";
import { User } from "lucide-react";
import type { AgentLogEntry } from "../../lib/types";

interface UserMessageProps {
  log: AgentLogEntry;
}

/**
 * UserMessage component displays messages sent by the user.
 * It uses a distinct style to differentiate from agent responses.
 */
export const UserMessage = memo(function UserMessage({ log }: UserMessageProps) {
  const content = log.content || "";
  const timestamp = log.receivedAt
    ? new Date(log.receivedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div 
      className="flex justify-end mb-[var(--spacing-8)] group animate-in fade-in slide-in-from-right-4 duration-500" 
      role="article" 
      aria-label="Your message"
    >
      <div className="max-w-[85%] md:max-w-[70%] flex flex-col items-end gap-[var(--spacing-2)]">
        <div className="bg-gradient-to-br from-zinc-800 via-zinc-900 to-black rounded-[var(--radius-3xl)] rounded-tr-none px-[var(--spacing-6)] py-[var(--spacing-4)] border border-zinc-700/40 shadow-2xl group-hover:border-emerald-500/20 transition-all duration-300">
          <div className="flex items-center justify-end gap-[var(--spacing-3)] mb-[var(--spacing-2)]">
            {timestamp && <span className="text-caption text-white/20">{timestamp}</span>}
            <span className="text-caption text-white/40 font-medium">You</span>
            <div 
              className="size-5 rounded-[var(--radius-lg)] bg-zinc-800 border border-zinc-700/50 grid place-items-center" 
              aria-hidden="true"
            >
              <User className="size-3 text-white/60" />
            </div>
          </div>
          <div className="text-white/95 text-md leading-relaxed tracking-tight whitespace-pre-wrap break-words">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
});
