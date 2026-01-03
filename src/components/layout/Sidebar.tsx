import { useState } from "react";
import {
  RotateCcw,
  Plus,
  Upload,
  Download,
  RefreshCcw,
  Settings,
  Brain,
  LayoutDashboard,
  Globe,
  ChevronRight,
  X,
  ListTodo,
  SlidersHorizontal,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { agentZeroApi } from "../../lib/agentZeroApi";
import { usePreferences } from "../../hooks/usePreferences";
import type { AgentContextSummary, AgentTaskSummary } from "../../lib/types";
import { Button } from "../ui/Button";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeContext: string | null;
  setActiveContext: (id: string | null) => void;
  contexts: AgentContextSummary[];
  tasks: AgentTaskSummary[];
  onOpenSettings: () => void;
  onOpenMemory: () => void;
  onOpenDashboard: () => void;
  onOpenProjects: () => void;
  onOpenTunnel: () => void;
}

export function Sidebar({
  isOpen,
  onClose,
  activeContext,
  setActiveContext,
  contexts,
  tasks,
  onOpenSettings,
  onOpenMemory,
  onOpenDashboard,
  onOpenProjects,
  onOpenTunnel,
}: SidebarProps) {
  const [tasksExpanded, setTasksExpanded] = useState(false);
  const [prefsExpanded, setPrefsExpanded] = useState(true);
  const { prefs, set } = usePreferences();

  async function handleResetChat() {
    if (!activeContext) return;
    if (!confirm("Reset this chat? All messages will be cleared.")) return;
    try {
      await agentZeroApi.chatReset(activeContext);
    } catch (e) {
      console.error("Failed to reset chat:", e);
    }
  }

  async function handleNewChat() {
    try {
      const res = await agentZeroApi.chatCreate({
        current_context: activeContext || undefined,
      });
      if (res.ctxid) {
        setActiveContext(res.ctxid);
      }
    } catch (e) {
      console.error("Failed to create chat:", e);
    }
  }

  async function handleLoadChat() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.multiple = true;
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files?.length) return;
      try {
        const chats: unknown[] = [];
        for (const file of files) {
          const text = await file.text();
          chats.push(JSON.parse(text));
        }
        await agentZeroApi.chatLoad(chats);
      } catch (e) {
        console.error("Failed to load chat:", e);
      }
    };
    input.click();
  }

  async function handleSaveChat() {
    if (!activeContext) return;
    try {
      const res = await agentZeroApi.chatExport(activeContext);
      const blob = new Blob([JSON.stringify(res.content, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chat-${activeContext}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to save chat:", e);
    }
  }

  async function handleRestart() {
    if (!confirm("Restart the agent? This will reset the backend.")) return;
    try {
      await agentZeroApi.restart();
    } catch (e) {
      console.error("Failed to restart:", e);
    }
  }

  async function handleDeleteChat(ctxId: string) {
    if (!confirm("Delete this chat?")) return;
    try {
      await agentZeroApi.chatRemove(ctxId);
      if (activeContext === ctxId) {
        setActiveContext(null);
      }
    } catch (e) {
      console.error("Failed to delete chat:", e);
    }
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 min-w-56 max-w-80 bg-card border-r border-border flex flex-col transform transition-transform duration-300 ease-in-out shadow-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        role="navigation"
        aria-label="Main sidebar"
      >
        {/* Logo area */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div
              className="size-10 rounded-xl bg-muted border border-border grid place-items-center text-xs font-black text-emerald-400 shadow-inner"
              aria-hidden="true"
            >
              AA
            </div>
            <span className="font-black text-sm tracking-tighter text-foreground uppercase italic">
              Aussie Agents
            </span>
          </div>

          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close sidebar" className="size-8">
            <X className="size-5" />
          </Button>
        </div>

        {/* Action buttons grid */}
        <div className="p-4 grid grid-cols-2 gap-2 border-b border-border" role="group" aria-label="Chat actions">
          <ActionButton icon={RotateCcw} label="Reset" onClick={handleResetChat} />
          <ActionButton icon={Plus} label="New Chat" onClick={handleNewChat} />
          <ActionButton icon={Upload} label="Load" onClick={handleLoadChat} />
          <ActionButton icon={Download} label="Save" onClick={handleSaveChat} disabled={!activeContext} />
          <ActionButton icon={RefreshCcw} label="Restart" onClick={handleRestart} />
          <ActionButton icon={Settings} label="Settings" onClick={onOpenSettings} />
          <ActionButton icon={Brain} label="Memory" onClick={onOpenMemory} />
          <ActionButton icon={LayoutDashboard} label="Dashboard" onClick={onOpenDashboard} />
          <ActionButton icon={Globe} label="Tunnel" onClick={onOpenTunnel} />
          <ActionButton icon={ListTodo} label="Projects" onClick={onOpenProjects} />
        </div>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {/* Chats list */}
          <div className="px-4 py-2">
            <h3 className="text-caption text-muted-foreground mb-3 px-1">Recent Chats</h3>
            <div className="space-y-1" role="list" aria-label="Recent conversations">
              {contexts.map((ctx) => (
                <div
                  key={ctx.id}
                  role="listitem"
                  className={cn(
                    "group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all active:scale-[0.98]",
                    ctx.id === activeContext
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "text-white/70 hover:bg-zinc-800/50 hover:text-white border border-transparent"
                  )}
                  onClick={() => {
                    setActiveContext(ctx.id);
                    onClose();
                  }}
                  aria-selected={ctx.id === activeContext}
                >
                  <div
                    className={cn(
                      "size-1.5 rounded-full flex-shrink-0 transition-all",
                      ctx.id === activeContext ? "bg-emerald-400 scale-125 shadow-emerald-glow" : "bg-zinc-700"
                    )}
                    aria-hidden="true"
                  />
                  <span className="flex-1 truncate text-sm font-medium">{ctx.name || ctx.id}</span>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChat(ctx.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 size-6 hover:text-red-400 hover:bg-red-400/10"
                    aria-label={`Delete chat ${ctx.name || ctx.id}`}
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              ))}
              {contexts.length === 0 && <p className="text-xs text-white/40 italic px-3 py-4 text-center">No chats yet</p>}
            </div>
          </div>

          {/* Tasks section */}
          <div className="p-3 border-t border-zinc-800/50">
            <button
              onClick={() => setTasksExpanded(!tasksExpanded)}
              className="w-full flex items-center justify-between text-xs font-medium text-white/50 uppercase tracking-wider hover:text-white/70 px-2"
            >
              <span className="flex items-center gap-2">
                <ListTodo className="size-4" />
                Tasks
              </span>
              <ChevronRight className={cn("size-4 transition-transform", tasksExpanded && "rotate-90")} />
            </button>
            {tasksExpanded && (
              <div className="mt-3 space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-accent cursor-pointer text-sm"
                    onClick={() => {
                      setActiveContext(task.id);
                      onClose();
                    }}
                  >
                    <span className="truncate">{task.task_name || task.id}</span>
                  </div>
                ))}
                {tasks.length === 0 && <p className="text-xs text-muted-foreground px-3 py-2">No tasks</p>}
              </div>
            )}
          </div>

          {/* Preferences section */}
          <div className="p-3 border-t border-border">
            <button
              onClick={() => setPrefsExpanded(!prefsExpanded)}
              className="w-full flex items-center justify-between text-caption text-muted-foreground hover:text-foreground transition-colors px-2 py-2"
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="size-3.5" />
                Preferences
              </span>
              <ChevronRight className={cn("size-3.5 transition-transform duration-300", prefsExpanded && "rotate-90")} />
            </button>
            {prefsExpanded && (
              <div className="mt-2 space-y-3 px-2">
                {/* Theme Toggle Group */}
                <div className="p-1.5 bg-muted rounded-xl border border-border flex gap-1">
                  <ThemeButton active={prefs.theme === "light"} onClick={() => set("theme", "light")} icon={Sun} label="Light" />
                  <ThemeButton active={prefs.theme === "dark"} onClick={() => set("theme", "dark")} icon={Moon} label="Dark" />
                  <ThemeButton active={prefs.theme === "system"} onClick={() => set("theme", "system")} icon={Monitor} label="System" />
                </div>

                <div className="space-y-1">
                  <PrefToggle label="Auto-scroll" value={prefs.autoScroll} onChange={(v) => set("autoScroll", v)} />
                  <PrefToggle label="Show thoughts" value={prefs.showThoughts} onChange={(v) => set("showThoughts", v)} />
                  <PrefToggle label="Show utils" value={prefs.showUtils} onChange={(v) => set("showUtils", v)} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Version */}
        <div className="p-4 border-t border-border text-xs text-muted-foreground">
          <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent font-black uppercase tracking-wider">
            Aussie Agents Workforce
          </span>
        </div>
      </aside>
    </>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function ThemeButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        "flex-1 flex items-center justify-center py-2 rounded-lg transition-all active:scale-95",
        active ? "bg-card text-emerald-400 shadow-inner border border-border" : "text-muted-foreground hover:text-foreground hover:bg-accent"
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full flex flex-col items-center justify-center gap-1.5 px-2 py-3 rounded-xl border border-border text-caption transition-all active:scale-95",
        disabled
          ? "opacity-30 cursor-not-allowed"
          : "hover:bg-muted hover:border-border/50 text-muted-foreground hover:text-foreground hover:shadow-lg"
      )}
    >
      <Icon className="size-4 flex-shrink-0 opacity-80" />
      <span className="truncate">{label}</span>
    </button>
  );
}

function PrefToggle({
  label,
  value,
  onChange,
  icon,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const Icon = icon;
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl border border-transparent hover:border-border hover:bg-accent transition-all group"
    >
      <span className="text-label text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
      <div
        className={cn(
          "size-8 rounded-lg flex items-center justify-center transition-all",
          value ? "bg-emerald-500/10 text-emerald-400 shadow-inner" : "bg-muted text-muted-foreground"
        )}
      >
        {Icon ? <Icon className="size-3.5" /> : value ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
      </div>
    </button>
  );
}
