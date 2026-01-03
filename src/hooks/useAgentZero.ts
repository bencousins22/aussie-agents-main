import { useCallback, useEffect, useMemo, useRef, useState, useOptimistic } from "react";
import { poll, sendMessageAsync } from "../lib/api";
import type { AgentLogEntry, AgentNotification, AgentTaskSummary, AgentContextSummary } from "../lib/types";

type OptimisticMessage = {
  messageId: string;
  text: string;
  createdAt: number;
};

export function useAgentZero() {
  const [connected, setConnected] = useState(false);

  const [activeContext, setActiveContext] = useState<string | null>(null);
  const [contexts, setContexts] = useState<AgentContextSummary[]>([]);
  const [tasks, setTasks] = useState<AgentTaskSummary[]>([]);

  const [logGuid, setLogGuid] = useState<string>("");
  const [logVersion, setLogVersion] = useState<number>(0);
  const [logs, setLogs] = useState<AgentLogEntry[]>([]);

  const [notificationsVersion, setNotificationsVersion] = useState<number>(0);
  const [notifications, setNotifications] = useState<AgentNotification[]>([]);

  const [progress, setProgress] = useState(0);
  const [progressActive, setProgressActive] = useState(false);
  const [paused, setPaused] = useState(false);

  const [optimisticLogs, addOptimisticLog] = useOptimistic<AgentLogEntry[], OptimisticMessage>(
    [],
    (state, optimisticMessage) => {
      const optimisticLog: AgentLogEntry = {
        id: optimisticMessage.messageId,
        type: "user",
        heading: "User message",
        content: optimisticMessage.text,
        temp: true,
        kvps: { pending: true },
        receivedAt: optimisticMessage.createdAt,
      };
      return [...state, optimisticLog];
    }
  );

  const pollInFlight = useRef(false);
  const stopped = useRef(false);

  const mergedLogs = useMemo(() => {
    const realLogs = logs.filter(Boolean);

    const ids = new Set<string>();
    const userContents = new Set<string>();
    
    for (const l of realLogs) {
      if (l.id != null) ids.add(String(l.id));
      if (l.type === "user" && l.content) userContents.add(l.content.trim());
    }

    const filteredOptimistic = optimisticLogs.filter((l) => {
      const idMatch = ids.has(String(l.id));
      const contentMatch = l.type === "user" && l.content && userContents.has(l.content.trim());
      return !idMatch && !contentMatch;
    });
    
    return [...realLogs, ...filteredOptimistic];
  }, [logs, optimisticLogs]);

  const mergeIncomingLogs = useCallback((incoming: AgentLogEntry[]) => {
    setLogs((prev) => {
      const next = [...prev];
      let changed = false;
      
      for (const item of incoming) {
        const no = item.no;
        const timestampedItem = {
          ...item,
          receivedAt: item.receivedAt || Date.now()
        };

        if (typeof no === "number" && Number.isFinite(no)) {
          if (next[no] !== item) {
            next[no] = timestampedItem;
            changed = true;
          }
        } else {
          next.push(timestampedItem);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, []);

  const doPoll = useCallback(async () => {
    if (pollInFlight.current || stopped.current) return;
    pollInFlight.current = true;

    try {
      const res = await poll({
        context: activeContext,
        logFrom: logVersion,
        notificationsFrom: notificationsVersion,
      });

      setConnected(true);

      if (res.deselect_chat) {
        setActiveContext(null);
      }

      setContexts(res.contexts || []);
      setTasks(res.tasks || []);

      setProgress(res.log_progress || 0);
      setProgressActive(Boolean(res.log_progress_active));
      setPaused(Boolean(res.paused));

      setNotificationsVersion(res.notifications_version || 0);
      if (Array.isArray(res.notifications) && res.notifications.length > 0) {
        setNotifications((prev) => [...prev, ...res.notifications]);
      }

      // If chat switched/reset, clear log buffer.
      const nextGuid = res.log_guid || "";
      if (nextGuid && logGuid && nextGuid !== logGuid) {
        const base = Array.isArray(res.logs) ? res.logs : [];
        const next: AgentLogEntry[] = [];
        for (const item of base) {
          const no = item.no;
          if (typeof no === "number" && Number.isFinite(no)) next[no] = item;
        }
        setLogs(next);
        setLogVersion(res.log_version || 0);
        setLogGuid(nextGuid);
      } else {
        setLogGuid(nextGuid);
        if (Array.isArray(res.logs) && res.logs.length > 0) mergeIncomingLogs(res.logs);
        setLogVersion(res.log_version || 0);
      }

      // Ensure we have an active context when backend selects one.
      if (res.context && res.context !== "") {
        setActiveContext(res.context);
      }
    } catch {
      setConnected(false);
    } finally {
      pollInFlight.current = false;
    }
  }, [activeContext, logGuid, logVersion, notificationsVersion, mergeIncomingLogs]);

  useEffect(() => {
    stopped.current = false;

    let timeout: number | undefined;
    let backoffMs = 500;

    const tick = async () => {
      if (stopped.current) return;

      await doPoll();

      // basic backoff when disconnected
      backoffMs = connected ? 500 : Math.min(backoffMs * 2, 5000);
      timeout = window.setTimeout(tick, backoffMs);
    };

    tick();

    return () => {
      stopped.current = true;
      if (timeout) window.clearTimeout(timeout);
    };
  }, [doPoll, connected]);

  const sendMessage = useCallback(
    async (args: { text: string; attachments: File[] }) => {
      const text = args.text.trim();
      if (!text && args.attachments.length === 0) return;

      const messageId = crypto.randomUUID();
      const optimisticMessage: OptimisticMessage = {
        messageId,
        text,
        createdAt: Date.now(),
      };
      
      addOptimisticLog(optimisticMessage);

      const res = await sendMessageAsync({
        context: activeContext,
        messageId,
        text,
        attachments: args.attachments,
      });

      if (res.context) {
        setActiveContext(res.context);
      }

      // Trigger immediate poll after sending to speed up UI response
      doPoll();
    },
    [activeContext, addOptimisticLog, doPoll]
  );

  return {
    connected,
    activeContext,
    setActiveContext,
    contexts,
    tasks,
    logs: mergedLogs,
    progress,
    progressActive,
    paused,
    notifications,
    sendMessage,
  };
}
