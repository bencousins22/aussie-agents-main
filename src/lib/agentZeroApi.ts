import { callJsonApi, fetchApi } from "./api";
import type { AgentLogEntry } from "./types";

export type ApiOk<T> = { ok: true } & T;
export type ApiErr = { ok?: false; success?: false; error: string };

export type FieldOption = {
  value: string;
  label: string;
};

export type SettingsField = {
  id: string;
  title: string;
  description?: string;
  type: "text" | "number" | "select" | "range" | "textarea" | "password" | "switch" | "button" | "html";
  value: unknown;
  min?: number;
  max?: number;
  step?: number;
  hidden?: boolean;
  options?: FieldOption[];
  style?: string;
};

export type SettingsSection = {
  id: string;
  title: string;
  description?: string;
  fields: SettingsField[];
  tab: string;
};

export type SettingsOutput = {
  sections: SettingsSection[];
};

export type SettingsGetResponse = { settings: SettingsOutput };
export type SettingsSetResponse = { settings: SettingsOutput };

export type HealthResponse = { gitinfo: unknown; error: string | null };

export type SchedulerTasksListResponse =
  | { ok: true; tasks: unknown[] }
  | { ok: false; error: string; tasks: unknown[] };

export type SchedulerTaskResponse = { ok: true; task: unknown } | { ok: false; error: string };

export type BackupDefaultsResponse =
  | { success: true; default_patterns: { include_patterns: string[]; exclude_patterns: string[] }; metadata: unknown }
  | { success: false; error: string };

export type BackupInspectResponse =
  | { success: true; metadata: unknown; files: unknown[]; include_patterns: string[]; exclude_patterns: string[]; [k: string]: unknown }
  | { success: false; error: string };

export type BackupRestorePreviewResponse =
  | { success: true; files: unknown[]; files_to_delete?: unknown[]; files_to_restore?: unknown[]; skipped_files: unknown[]; [k: string]: unknown }
  | { success: false; error: string };

export type BackupRestoreResponse =
  | { success: true; restored_files: unknown[]; deleted_files?: unknown[]; skipped_files: unknown[]; errors: unknown[]; backup_metadata: unknown; [k: string]: unknown }
  | { success: false; error: string };

export type ProjectsResponse = { ok: boolean; data?: unknown; error?: string };

export type MemoryDashboardResponse =
  | { success: true; [k: string]: unknown }
  | { success: false; error: string; memories?: unknown[]; total_count?: number };

export type NotificationsHistoryResponse = { notifications: unknown[]; guid: string; count: number };

export type NotificationsClearResponse = { success: boolean; message?: string; error?: string };

export type UploadWorkDirFilesResponse = {
  message: string;
  data: unknown;
  successful: string[];
  failed: string[];
};

export type DeleteWorkDirFileResponse = { data: unknown };

export type GetWorkDirFilesResponse = { data: unknown };

export type FileInfoResponse = {
  input_path: string;
  abs_path: string;
  exists: boolean;
  is_dir: boolean;
  is_file: boolean;
  is_link: boolean;
  size: number;
  modified: number;
  created: number;
  permissions: number;
  dir_path: string;
  file_name: string;
  file_ext: string;
  message: string;
};

export type ChatCreateResponse = { ok: true; ctxid: string; message: string };
export type ChatResetResponse = { message: string };
export type ChatRemoveResponse = { message: string };
export type ChatExportResponse = { message: string; ctxid: string; content: unknown };
export type ChatLoadResponse = { message: string; ctxids: string[] };
export type ChatFilesPathResponse = { ok: boolean; path?: string; error?: string };

export type McpServersStatusResponse = { success: boolean; status?: unknown; error?: string };
export type McpServersApplyResponse = { success: boolean; status?: unknown; error?: string };

export type PauseResponse = { success?: boolean; paused?: boolean; message?: string; error?: string };
export type NudgeResponse = { success?: boolean; message?: string; error?: string };
export type RestartResponse = { success?: boolean; message?: string; error?: string };

export type TunnelStatusResponse = {
  success: boolean;
  tunnel_url?: string;
  is_running?: boolean;
  message?: string;
  error?: string;
};

export type PollResponse = {
  messages?: Array<{ content: string; role: string; timestamp: number }>;
  log?: string[];
  logs?: AgentLogEntry[];
  notifications?: unknown[];
  deselect_chat?: boolean;
  contexts?: unknown[];
  tasks?: unknown[];
  log_progress?: number;
  log_progress_active?: boolean;
  paused?: boolean;
  notifications_version?: number;
  log_guid?: string;
  log_version?: number;
  context?: string;
  error?: string;
};

export const agentZeroApi = {
  health(): Promise<HealthResponse> {
    return callJsonApi<HealthResponse>("/health", null);
  },

  chatCreate(args: { current_context?: string; new_context?: string }): Promise<ChatCreateResponse> {
    return callJsonApi<ChatCreateResponse>("/chat_create", {
      current_context: args.current_context || "",
      new_context: args.new_context,
    });
  },

  chatReset(context: string): Promise<ChatResetResponse> {
    return callJsonApi<ChatResetResponse>("/chat_reset", { context });
  },

  chatRemove(context: string): Promise<ChatRemoveResponse> {
    return callJsonApi<ChatRemoveResponse>("/chat_remove", { context });
  },

  chatExport(ctxid: string): Promise<ChatExportResponse> {
    return callJsonApi<ChatExportResponse>("/chat_export", { ctxid });
  },

  chatLoad(chats: unknown[]): Promise<ChatLoadResponse> {
    return callJsonApi<ChatLoadResponse>("/chat_load", { chats });
  },

  chatFilesPathGet(ctxid: string): Promise<ChatFilesPathResponse> {
    return callJsonApi<ChatFilesPathResponse>("/chat_files_path_get", { ctxid });
  },

  async sendMessageAsync(args: {
    context: string | null;
    messageId: string;
    text: string;
    attachments: File[];
  }): Promise<{ message: string; context: string }> {
    const { sendMessageAsync } = await import("./api");
    return sendMessageAsync(args);
  },

  poll(args: {
    context: string | null;
    logFrom: number;
    notificationsFrom: number;
  }): Promise<PollResponse> {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return callJsonApi<PollResponse>("/poll", {
      log_from: args.logFrom,
      notifications_from: args.notificationsFrom,
      context: args.context,
      timezone,
    });
  },

  settingsGet(): Promise<SettingsGetResponse> {
    return fetchApi("/settings_get", { method: "GET" }).then(
      async (r) => (await r.json()) as SettingsGetResponse
    );
  },

  settingsSet(settingsPayload: unknown): Promise<SettingsSetResponse> {
    return callJsonApi<SettingsSetResponse>("/settings_set", settingsPayload);
  },

  projects(action: string, payload: Record<string, unknown> = {}): Promise<ProjectsResponse> {
    return callJsonApi<ProjectsResponse>("/projects", { action, ...payload });
  },

  memoryDashboard(action: string, payload: Record<string, unknown> = {}): Promise<MemoryDashboardResponse> {
    return callJsonApi<MemoryDashboardResponse>("/memory_dashboard", { action, ...payload });
  },

  notificationsHistory(): Promise<NotificationsHistoryResponse> {
    return callJsonApi<NotificationsHistoryResponse>("/notifications_history", null);
  },

  notificationsClear(): Promise<NotificationsClearResponse> {
    return callJsonApi<NotificationsClearResponse>("/notifications_clear", null);
  },

  schedulerTasksList(timezone?: string): Promise<SchedulerTasksListResponse> {
    return callJsonApi<SchedulerTasksListResponse>("/scheduler_tasks_list", timezone ? { timezone } : {});
  },

  schedulerTaskCreate(payload: unknown): Promise<SchedulerTaskResponse> {
    return callJsonApi<SchedulerTaskResponse>("/scheduler_task_create", payload);
  },

  schedulerTaskUpdate(payload: unknown): Promise<unknown> {
    return callJsonApi<unknown>("/scheduler_task_update", payload);
  },

  schedulerTaskDelete(payload: unknown): Promise<unknown> {
    return callJsonApi<unknown>("/scheduler_task_delete", payload);
  },

  schedulerTaskRun(payload: unknown): Promise<unknown> {
    return callJsonApi<unknown>("/scheduler_task_run", payload);
  },

  schedulerTick(payload: unknown): Promise<unknown> {
    return callJsonApi<unknown>("/scheduler_tick", payload);
  },

  backupGetDefaults(): Promise<BackupDefaultsResponse> {
    return callJsonApi<BackupDefaultsResponse>("/backup_get_defaults", null);
  },

  async backupCreateZip(payload: {
    include_patterns?: string[];
    exclude_patterns?: string[];
    include_hidden?: boolean;
    backup_name?: string;
  }): Promise<Blob> {
    const res = await fetchApi("/backup_create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    return await res.blob();
  },

  async backupInspect(file: File): Promise<BackupInspectResponse> {
    const formData = new FormData();
    formData.append("backup_file", file);

    const res = await fetchApi("/backup_inspect", {
      method: "POST",
      body: formData,
    });

    return (await res.json()) as BackupInspectResponse;
  },

  async backupRestorePreview(args: {
    file: File;
    metadata: unknown;
    overwrite_policy?: "overwrite" | "skip" | "backup";
    clean_before_restore?: boolean;
  }): Promise<BackupRestorePreviewResponse> {
    const formData = new FormData();
    formData.append("backup_file", args.file);
    formData.append("metadata", JSON.stringify(args.metadata ?? {}));
    formData.append("overwrite_policy", args.overwrite_policy || "overwrite");
    formData.append("clean_before_restore", args.clean_before_restore ? "true" : "false");

    const res = await fetchApi("/backup_restore_preview", {
      method: "POST",
      body: formData,
    });

    return (await res.json()) as BackupRestorePreviewResponse;
  },

  async backupRestore(args: {
    file: File;
    metadata: unknown;
    overwrite_policy?: "overwrite" | "skip" | "backup";
    clean_before_restore?: boolean;
  }): Promise<BackupRestoreResponse> {
    const formData = new FormData();
    formData.append("backup_file", args.file);
    formData.append("metadata", JSON.stringify(args.metadata ?? {}));
    formData.append("overwrite_policy", args.overwrite_policy || "overwrite");
    formData.append("clean_before_restore", args.clean_before_restore ? "true" : "false");

    const res = await fetchApi("/backup_restore", {
      method: "POST",
      body: formData,
    });

    return (await res.json()) as BackupRestoreResponse;
  },

  async getWorkDirFiles(path: string): Promise<GetWorkDirFilesResponse> {
    const url = new URL("/get_work_dir_files", window.location.origin);
    url.searchParams.set("path", path);
    const res = await fetchApi(url.toString(), { method: "GET" });
    return (await res.json()) as GetWorkDirFilesResponse;
  },

  async uploadWorkDirFiles(args: { path: string; files: File[] }): Promise<UploadWorkDirFilesResponse> {
    const formData = new FormData();
    formData.append("path", args.path);
    args.files.forEach(f => formData.append("files[]", f));

    const res = await fetchApi("/upload_work_dir_files", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    return (await res.json()) as UploadWorkDirFilesResponse;
  },

  deleteWorkDirFile(args: { path: string; currentPath: string }): Promise<DeleteWorkDirFileResponse> {
    return callJsonApi<DeleteWorkDirFileResponse>("/delete_work_dir_file", {
      path: args.path,
      currentPath: args.currentPath,
    });
  },

  async fileInfo(path: string): Promise<FileInfoResponse> {
    return callJsonApi<FileInfoResponse>("/file_info", { path });
  },

  async downloadWorkDirFile(path: string): Promise<Blob> {
    const url = new URL("/download_work_dir_file", window.location.origin);
    url.searchParams.set("path", path);
    const res = await fetchApi(url.toString(), { method: "GET" });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    return await res.blob();
  },

  mcpServersStatus(): Promise<McpServersStatusResponse> {
    return callJsonApi<McpServersStatusResponse>("/mcp_servers_status", null);
  },

  mcpServersApply(mcp_servers: unknown): Promise<McpServersApplyResponse> {
    return callJsonApi<McpServersApplyResponse>("/mcp_servers_apply", { mcp_servers });
  },

  pause(context: string, paused: boolean): Promise<PauseResponse> {
    return callJsonApi<PauseResponse>("/pause", { context, paused });
  },

  nudge(context: string): Promise<NudgeResponse> {
    return callJsonApi<NudgeResponse>("/nudge", { context });
  },

  restart(): Promise<RestartResponse> {
    return callJsonApi<RestartResponse>("/restart", null);
  },

  tunnelStatus(): Promise<TunnelStatusResponse> {
    return callJsonApi<TunnelStatusResponse>("/tunnel_proxy", { action: "get" });
  },

  tunnelCreate(provider = "serveo", port?: number): Promise<TunnelStatusResponse> {
    return callJsonApi<TunnelStatusResponse>("/tunnel_proxy", { action: "create", provider, port });
  },

  tunnelStop(): Promise<TunnelStatusResponse> {
    return callJsonApi<TunnelStatusResponse>("/tunnel_proxy", { action: "stop" });
  },

  tunnelVerify(url: string): Promise<TunnelStatusResponse> {
    return callJsonApi<TunnelStatusResponse>("/tunnel_proxy", { action: "verify", url });
  },
};
