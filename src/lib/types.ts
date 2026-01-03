export type AgentLogType =
  | "user"
  | "agent"
  | "response"
  | "tool"
  | "code_exe"
  | "browser"
  | "warning"
  | "rate_limit"
  | "error"
  | "info"
  | "util"
  | "hint"
  | string;

export type AgentLogEntry = {
  id?: string | number;
  no?: number;
  type: AgentLogType;
  heading?: string;
  content?: string;
  temp?: boolean;
  receivedAt?: number;
  kvps?: Record<string, unknown> | null;
};

export type AgentContextSummary = {
  id: string;
  name?: string;
  created_at?: number;
  updated_at?: number;
  [k: string]: unknown;
};

export type AgentTaskSummary = AgentContextSummary & {
  task_name?: string;
  uuid?: string;
  state?: string;
  type?: string;
  last_run?: unknown;
  last_result?: unknown;
  attachments?: string[];
  schedule?: unknown;
  plan?: unknown;
  token?: string;
};

export type AgentNotification = {
  id?: string | number;
  no?: number;
  type?: string;
  title?: string;
  message?: string;
  [k: string]: unknown;
};

export type PollResponse = {
  deselect_chat?: boolean;
  context: string;
  contexts: AgentContextSummary[];
  tasks: AgentTaskSummary[];
  logs: AgentLogEntry[];
  log_guid: string;
  log_version: number;
  log_progress: number;
  log_progress_active: boolean;
  paused: boolean;

  notifications: AgentNotification[];
  notifications_guid: string;
  notifications_version: number;
};
