import { useEffect, useMemo, useRef, useState, lazy, Suspense, useCallback, Fragment } from "react";

import { useAgentZero } from "../../hooks/useAgentZero";
import { usePreferences } from "../../hooks/usePreferences";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import type { AgentLogEntry } from "../../lib/types";
import { agentZeroApi } from "../../lib/agentZeroApi";

import { Sidebar } from "../layout/Sidebar";
import { TopBar } from "../layout/TopBar";
import { ChatInput } from "./ChatInput";
import { UserMessage } from "./UserMessage";
import { ResponseBlock } from "./ResponseBlock";
import { ToolWidget } from "./ToolWidget";
import { ThinkingWidget } from "./ThinkingWidget";
import { ToastContainer } from "../ui/Toast";
import { useToast } from "../../hooks/useToast";
import { Loader2, X } from "lucide-react";

// Lazy load modals for better performance
const SettingsModal = lazy(() => import("../modals/SettingsModal").then(m => ({ default: m.SettingsModal })));
const MemoryModal = lazy(() => import("../modals/MemoryModal").then(m => ({ default: m.MemoryModal })));
const DashboardModal = lazy(() => import("../modals/DashboardModal").then(m => ({ default: m.DashboardModal })));
const FilesModal = lazy(() => import("../modals/FilesModal").then(m => ({ default: m.FilesModal })));
const HistoryModal = lazy(() => import("../modals/HistoryModal").then(m => ({ default: m.HistoryModal })));
const ContextModal = lazy(() => import("../modals/ContextModal").then(m => ({ default: m.ContextModal })));
const ProjectsModal = lazy(() => import("../modals/ProjectsModal").then(m => ({ default: m.ProjectsModal })));
const KeyboardShortcutsModal = lazy(() => import("../modals/KeyboardShortcutsModal").then(m => ({ default: m.KeyboardShortcutsModal })));

function isToolLikeLog(msg: AgentLogEntry) {
  return ["tool", "code_exe", "browser"].includes(String(msg.type));
}

function isThinkingLog(msg: AgentLogEntry) {
  return String(msg.type) === "agent";
}

function isUserLog(msg: AgentLogEntry) {
  return String(msg.type) === "user";
}

function isResponseLog(msg: AgentLogEntry) {
  return String(msg.type) === "response";
}

export function ChatApp() {
  const {
    connected,
    activeContext,
    setActiveContext,
    contexts,
    tasks,
    logs,
    progress,
    progressActive,
    sendMessage,
    paused,
    notifications,
  } = useAgentZero();
  const { prefs } = usePreferences();
  const { toasts, removeToast, success, error: showError } = useToast();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPausing, setIsPausing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState('agent');
  const [memoryOpen, setMemoryOpen] = useState(false);
// ...
  const handleOpenSettings = useCallback((tab: string = 'agent') => {
    setSettingsTab(tab);
    setSettingsOpen(true);
  }, []);

  const handleOpenTunnel = useCallback(() => {
    handleOpenSettings('tunnel');
  }, [handleOpenSettings]);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [filesOpen, setFilesOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeProjectName, setActiveProjectName] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  const isAgentProcessing = progressActive && !paused;

  // Fetch active project name
  useEffect(() => {
    const fetchActiveProject = async () => {
      try {
        const res = await agentZeroApi.projects("list");
        if (res?.ok && Array.isArray(res.data)) {
          const active = res.data.find((p: { active?: boolean }) => p.active);
          setActiveProjectName(active?.title || active?.name || null);
        }
      } catch {
        // ignore
      }
    };
    if (connected) fetchActiveProject();
  }, [connected, projectsOpen]);

  const handlePauseToggle = useCallback(async () => {
    if (!activeContext || isPausing) return;
    setIsPausing(true);
    try {
      await agentZeroApi.pause(activeContext, !paused);
      success(paused ? "Agent resumed" : "Agent paused");
    } catch (e) {
      showError("Failed to toggle pause", (e as Error)?.message);
    } finally {
      setIsPausing(false);
    }
  }, [activeContext, isPausing, paused, success, showError]);

  // Show connection error toast
  useEffect(() => {
    if (!connected && logs.length > 0) {
      showError("Connection lost. Attempting to reconnect...", "System Offline");
    }
  }, [connected, logs.length, showError]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSearch: () => setSearchOpen(true),
    onCloseModals: () => {
      setSettingsOpen(false);
      setMemoryOpen(false);
      setDashboardOpen(false);
      setFilesOpen(false);
      setHistoryOpen(false);
      setContextOpen(false);
      setProjectsOpen(false);
      setHelpOpen(false);
      setSearchOpen(false);
    },
    onToggleSidebar: () => setSidebarOpen(!sidebarOpen),
    onNewChat: async () => {
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
    },
    onSettings: () => setSettingsOpen(true),
    onFocusInput: () => {
      const input = document.querySelector('textarea');
      if (input instanceof HTMLTextAreaElement) input.focus();
    },
    onTogglePause: () => handlePauseToggle(),
    onShowHelp: () => setHelpOpen(true),
    onClearChat: async () => {
      if (!activeContext) return;
      if (!confirm("Reset this chat? All messages will be cleared.")) return;
      try {
        await agentZeroApi.chatReset(activeContext);
      } catch (e) {
        console.error("Failed to reset chat:", e);
      }
    },
  });

  const visibleMessages = useMemo(() => {
    return logs.filter((l) => {
      const type = String(l.type);
      const validTypes = [
        "user",
        "agent",
        "response",
        "tool",
        "code_exe",
        "browser",
        "warning",
        "error",
        "info",
        "hint",
        "util",
        "rate_limit",
      ];
      if (!validTypes.includes(type)) return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const content = (l.content || "").toLowerCase();
        const heading = (l.heading || "").toLowerCase();
        if (!content.includes(query) && !heading.includes(query)) return false;
      }
      
      // Preferences filters
      if (type === "agent" && !prefs.showThoughts) return false;
      if (type === "util" && !prefs.showUtils) return false;
      
      // Filter out empty content messages
      const content = (l.content || "").trim();
      if (!content || content === "[]" || content === "{}" || content === "null") {
        // Keep if it has a meaningful heading
        const heading = (l.heading || "").trim();
        if (!heading) return false;
      }
      return true;
    });
  }, [logs, prefs.showThoughts, prefs.showUtils, searchQuery]);

  useEffect(() => {
    if (!prefs.autoScroll) return;
    requestAnimationFrame(() =>
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    );
  }, [visibleMessages.length, prefs.autoScroll]);

  const handleSendMessage = useCallback(async (text: string, files: File[]) => {
    await sendMessage({ text, attachments: files });
  }, [sendMessage]);

  const activeChatName = useMemo(() => {
    if (!activeContext) return null;
    return contexts.find(c => c.id === activeContext)?.name || activeContext;
  }, [activeContext, contexts]);

  const docTitle = useMemo(() => {
    let base = "Aussie Agents";
    if (activeChatName) base = `${activeChatName} | ${base}`;
    if (progressActive) base = `[${Math.round(progress)}%] ${base}`;
    else if (paused) base = `(Paused) ${base}`;
    return base;
  }, [activeChatName, progressActive, progress, paused]);

  const statusText = progressActive
    ? `Working... ${Math.round(progress)}%`
    : paused
    ? "Paused"
    : undefined;

  return (
    <div className="relative w-full h-dvh overflow-hidden bg-background text-foreground flex">
      {/* React 19 Document Metadata */}
      <title>{docTitle}</title>
      <meta name="description" content="Aussie Agents specialized workforce interface." />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeContext={activeContext}
        setActiveContext={setActiveContext}
        contexts={contexts}
        tasks={tasks}
        onOpenSettings={() => handleOpenSettings('agent')}
        onOpenTunnel={handleOpenTunnel}
        onOpenMemory={() => setMemoryOpen(true)}
        onOpenDashboard={() => setDashboardOpen(true)}
        onOpenProjects={() => setProjectsOpen(true)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        {/* Top bar */}
        <TopBar
          connected={connected}
          onMenuClick={() => setSidebarOpen(true)}
          notifications={notifications}
          onOpenProjects={() => setProjectsOpen(true)}
          activeProjectName={activeProjectName}
        />

        {/* Messages area */}
        <section className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 sm:py-6 space-y-4 no-scrollbar min-h-0">
          {/* Typing indicator */}
          {isAgentProcessing && (
            <div className="flex items-center gap-3 px-4 py-3 mx-auto max-w-4xl">
              <div className="flex items-center gap-1">
                <div className="size-2 rounded-full bg-emerald-400" />
                <div className="size-2 rounded-full bg-emerald-400 opacity-60" />
                <div className="size-2 rounded-full bg-emerald-400 opacity-30" />
              </div>
              <span className="text-sm text-white/60 font-medium hidden sm:inline">Aussie Agents is thinking...</span>
              <span className="text-sm text-white/60 font-medium sm:hidden">Thinking...</span>
            </div>
          )}
          {visibleMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full px-4 sm:px-6">
              <div className="text-center text-white/50 max-w-lg">
                <div className="size-20 sm:size-24 mx-auto mb-4 sm:mb-6 rounded-2xl sm:rounded-3xl bg-zinc-800 border border-zinc-700 grid place-items-center text-2xl sm:text-3xl font-bold text-emerald-400 shadow-xl shadow-emerald-500/20">
                  AA
                </div>
                <p className="text-lg sm:text-xl font-black bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent mb-2 sm:mb-3 tracking-tighter">
                  Aussie Agents
                </p>
                <p className="text-xs sm:text-sm text-white/40 mb-4 sm:mb-5 font-medium">Your specialized agent workforce. Ready to build, research, and automate.</p>
                <div className="flex items-center justify-center gap-3 text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
                  <div className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
                  <span>System Online</span>
                  <div className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
                </div>
              </div>
            </div>
          ) : (
            <Fragment>
              {visibleMessages.map((m) => {
                const key = String(m.id ?? m.no ?? `${m.type}-${m.heading}-${m.content}`);
                
                if (isUserLog(m)) {
                  return <UserMessage key={key} log={m} />;
                }
                if (isResponseLog(m)) {
                  return <ResponseBlock key={key} log={m} />;
                }
                if (isToolLikeLog(m)) {
                  return <ToolWidget key={key} log={m} />;
                }
                if (isThinkingLog(m)) {
                  return <ThinkingWidget key={key} log={m} />;
                }
                return null;
              })}
            </Fragment>
          )}
          <div ref={bottomRef} />
        </section>

        {/* Input area */}
        <ChatInput
          onSubmit={handleSendMessage}
          disabled={!connected}
          statusText={statusText}
          activeContext={activeContext}
          paused={paused}
          onPauseToggle={handlePauseToggle}
          isPausing={isPausing}
          onOpenFiles={() => setFilesOpen(true)}
          onOpenHistory={() => setHistoryOpen(true)}
          onOpenContext={() => setContextOpen(true)}
          onOpenProjects={() => setProjectsOpen(true)}
          connected={connected}
        />
      </div>

      <Suspense fallback={
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-[28px] shadow-2xl flex flex-col items-center gap-4">
            <Loader2 className="size-8 text-emerald-400 animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Initializing Module...</span>
          </div>
        </div>
      }>
        <SettingsModal 
          open={settingsOpen} 
          onClose={() => setSettingsOpen(false)} 
          initialTab={settingsTab}
          onOpenMemoryDashboard={() => {
            setSettingsOpen(false);
            setDashboardOpen(true);
          }}
        />
        <MemoryModal
          open={memoryOpen}
          onClose={() => setMemoryOpen(false)}
          activeContext={activeContext}
        />
        <DashboardModal open={dashboardOpen} onClose={() => setDashboardOpen(false)} />
        <FilesModal
          open={filesOpen}
          onClose={() => setFilesOpen(false)}
          activeContext={activeContext}
        />
        <HistoryModal
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
          activeContext={activeContext}
        />
        <ContextModal
          open={contextOpen}
          onClose={() => setContextOpen(false)}
          activeContext={activeContext}
          setActiveContext={setActiveContext}
          contexts={contexts}
          tasks={tasks}
        />
        <ProjectsModal
          open={projectsOpen}
          onClose={() => setProjectsOpen(false)}
          activeContext={activeContext}
        />
        <KeyboardShortcutsModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      </Suspense>
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      
      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 p-3">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          />
          <div
            className="relative w-full max-w-lg bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-white">Search Chat History</h3>
              <button
                onClick={() => setSearchOpen(false)}
                className="size-7 grid place-items-center rounded-lg text-white/80 hover:text-white hover:bg-zinc-800"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="p-3">
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2.5 sm:py-2 rounded-lg border border-zinc-800 bg-black/30 text-sm text-white placeholder:text-white/70 outline-none focus:border-emerald-400/40"
                autoFocus
                autoComplete="off"
              />
              <div className="mt-2 text-[11px] sm:text-xs text-white/80">
                Found {visibleMessages.length} messages
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
