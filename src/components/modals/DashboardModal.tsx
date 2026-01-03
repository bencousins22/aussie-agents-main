import { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { ModalShell } from "./ModalShell";
import { agentZeroApi, type HealthResponse } from "../../lib/agentZeroApi";
import type { AgentNotification, AgentTaskSummary } from "../../lib/types";

export function DashboardModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [notifications, setNotifications] = useState<AgentNotification[]>([]);
  const [tasks, setTasks] = useState<AgentTaskSummary[]>([]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [h, n, t] = await Promise.all([
        agentZeroApi.health(),
        agentZeroApi.notificationsHistory(),
        agentZeroApi.schedulerTasksList(),
      ]);
      setHealth(h);
      setNotifications(n?.notifications || []);
      if (t.ok) {
        setTasks(t.tasks || []);
      }
    } catch (e) {
      setError((e as Error)?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    load();
  }, [open]);

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      widthClassName="max-w-6xl"
      title={
        <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
          Aussie Agents Dashboard
        </span>
      }
    >
      <div className="p-5 space-y-5">
        <div className="flex items-center justify-between">
          <div className="text-xs text-white/50">Health, notifications, scheduler tasks</div>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-black/20 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-zinc-800"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            Refresh
          </button>
        </div>

        {error ? <div className="text-sm text-red-400">{error}</div> : null}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Panel title="Health">
            {health ? (
              <pre className="text-xs text-white/70 whitespace-pre-wrap break-words font-mono">{JSON.stringify(health, null, 2)}</pre>
            ) : (
              <div className="text-sm text-white/40">No data</div>
            )}
          </Panel>

          <Panel title="Recent notifications">
            {notifications.length ? (
              <div className="space-y-2">
                {notifications.slice(0, 8).map((n, i) => (
                  <div key={n.id || i} className="rounded-lg border border-zinc-800 bg-black/20 px-3 py-2">
                    <div className="text-sm text-white/80 font-medium">{n.title || "Notification"}</div>
                    <div className="text-xs text-white/50 mt-0.5">{n.message || ""}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-white/40">No notifications</div>
            )}
          </Panel>

          <Panel title="Scheduler tasks">
            {tasks.length ? (
              <div className="space-y-2">
                {tasks.slice(0, 10).map((t, i) => (
                  <div key={t.id || i} className="rounded-lg border border-zinc-800 bg-black/20 px-3 py-2">
                    <div className="text-sm text-white/80 font-medium">{t.task_name || t.id || "Task"}</div>
                    <div className="text-xs text-white/50 mt-0.5">{t.state || ""}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-white/40">No tasks</div>
            )}
          </Panel>
        </div>
      </div>
    </ModalShell>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800 text-sm font-semibold text-white/80">{title}</div>
      <div className="p-4">{children}</div>
    </div>
  );
}
