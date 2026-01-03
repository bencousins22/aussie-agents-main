import { ModalShell } from "./ModalShell";
import type { AgentContextSummary, AgentTaskSummary } from "../../lib/types";
import { cn } from "../../lib/utils";

export function ContextModal({
  open,
  onClose,
  activeContext,
  setActiveContext,
  contexts,
  tasks,
}: {
  open: boolean;
  onClose: () => void;
  activeContext: string | null;
  setActiveContext: (id: string | null) => void;
  contexts: AgentContextSummary[];
  tasks: AgentTaskSummary[];
}) {
  return (
    <ModalShell
      open={open}
      onClose={onClose}
      widthClassName="max-w-4xl"
      title={
        <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
          Aussie Agents Context
        </span>
      }
    >
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Section title="Chats">
            <div className="space-y-1">
              {contexts.map((ctx) => (
                <button
                  key={ctx.id}
                  type="button"
                  onClick={() => {
                    setActiveContext(ctx.id);
                    onClose();
                  }}
                  className={cn(
                    "w-full text-left rounded-lg px-3 py-2 border transition-colors",
                    ctx.id === activeContext
                      ? "border-emerald-400/30 bg-emerald-500/10 text-white"
                      : "border-zinc-800 bg-black/20 text-white/70 hover:bg-zinc-800 hover:text-white"
                  )}
                >
                  <div className="text-sm font-medium truncate">{ctx.name || ctx.id}</div>
                  <div className="text-xs text-white/40 truncate">{ctx.id}</div>
                </button>
              ))}
              {contexts.length === 0 ? (
                <div className="text-sm text-white/40">No chats</div>
              ) : null}
            </div>
          </Section>

          <Section title="Tasks">
            <div className="space-y-1">
              {tasks.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setActiveContext(t.id);
                    onClose();
                  }}
                  className={cn(
                    "w-full text-left rounded-lg px-3 py-2 border transition-colors",
                    t.id === activeContext
                      ? "border-emerald-400/30 bg-emerald-500/10 text-white"
                      : "border-zinc-800 bg-black/20 text-white/70 hover:bg-zinc-800 hover:text-white"
                  )}
                >
                  <div className="text-sm font-medium truncate">{t.task_name || t.id}</div>
                  <div className="text-xs text-white/40 truncate">{t.state || ""}</div>
                </button>
              ))}
              {tasks.length === 0 ? (
                <div className="text-sm text-white/40">No tasks</div>
              ) : null}
            </div>
          </Section>
        </div>
      </div>
    </ModalShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800 text-sm font-semibold text-white/80">{title}</div>
      <div className="p-4">{children}</div>
    </div>
  );
}
