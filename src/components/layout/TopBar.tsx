import { useState, useEffect } from "react";
import { Menu, Bell, ChevronDown } from "lucide-react";
import type { AgentNotification } from "../../lib/types";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";

interface TopBarProps {
  connected: boolean;
  onMenuClick: () => void;
  notifications: AgentNotification[];
  onOpenProjects: () => void;
  activeProjectName?: string | null;
}

export function TopBar({
  connected,
  onMenuClick,
  notifications,
  onOpenProjects,
  activeProjectName,
}: TopBarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    const h = hours % 12 || 12;
    return `${h}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <header
      className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-zinc-800/50 bg-black/20 backdrop-blur-sm"
      role="banner"
    >
      {/* Left side */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          aria-label="Open sidebar"
          className="size-10"
        >
          <Menu className="size-5" />
        </Button>

        <div
          className="size-10 rounded-xl bg-zinc-800 border border-zinc-700/80 grid place-items-center text-xs font-black text-emerald-400 shadow-inner"
          aria-hidden="true"
        >
          AA
        </div>

        <Badge
          variant={connected ? "primary" : "error"}
          size="md"
          dot
          className="px-3 py-1.5"
        >
          {connected ? "Connected" : "Disconnected"}
        </Badge>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Time */}
        <div className="text-xs text-white/50 font-mono hidden sm:block" aria-label="Current time">
          {formatTime(currentTime)}
        </div>
        <div className="text-white/60 text-xs hidden sm:block" aria-label="Current date">
          {formatDate(currentTime)}
        </div>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNotifOpen(!notifOpen)}
            aria-label={`${notifications.length} notifications`}
            aria-expanded={notifOpen}
            aria-haspopup="true"
            className="size-9"
          >
            <Bell className="size-4" />
            {notifications.length > 0 && (
              <div className="absolute -top-1 -right-1 size-3 bg-red-500 rounded-full" aria-hidden="true" />
            )}
          </Button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 top-14 z-50 w-80 bg-zinc-900 border border-zinc-800/50 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl">
                <div className="px-4 py-3 border-b border-zinc-800 font-bold text-sm text-white/90">
                  Notifications
                </div>
                <div className="max-h-80 overflow-y-autono-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-white/40 text-sm italic">No notifications</div>
                  ) : (
                    notifications.slice(0, 10).map((n, i) => (
                      <div
                        key={n.id || i}
                        className="p-4 border-b border-zinc-800 last:border-0 hover:bg-zinc-800/30 transition-colors cursor-default"
                      >
                        <div className="font-semibold text-sm text-white">{n.title || "Notification"}</div>
                        <div className="text-white/70 text-xs mt-1 leading-relaxed">{n.message}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Project selector */}
        <Button
          variant="primary"
          size="sm"
          onClick={onOpenProjects}
          rightIcon={<ChevronDown className="size-4 opacity-70" />}
          aria-label="Select project"
        >
          {activeProjectName || "No project"}
        </Button>
      </div>
    </header>
  );
}
