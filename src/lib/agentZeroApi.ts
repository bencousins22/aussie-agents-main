/* eslint-disable @typescript-eslint/no-explicit-any */

import { callJsonApi, fetchApi } from "./api";

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
  value: any;
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

export type HealthResponse = { gitinfo: any; error: string | null };

export type SchedulerTasksListResponse =
  | { ok: true; tasks: any[] }
  | { ok: false; error: string; tasks: any[] };

export type SchedulerTaskResponse = { ok: true; task: any } | { ok: false; error: string };

export type BackupDefaultsResponse =
  | { success: true; default_patterns: { include_patterns: string[]; exclude_patterns: string[] }; metadata: any }
  | { success: false; error: string };

export type BackupInspectResponse =
  | { success: true; metadata: any; files: any[]; include_patterns: string[]; exclude_patterns: string[]; [k: string]: any }
  | { success: false; error: string };

export type BackupRestorePreviewResponse =
  | { success: true; files: any[]; files_to_delete?: any[]; files_to_restore?: any[]; skipped_files: any[]; [k: string]: any }
  | { success: false; error: string };

export type BackupRestoreResponse =
  | { success: true; restored_files: any[]; deleted_files?: any[]; skipped_files: any[]; errors: any[]; backup_metadata: any; [k: string]: any }
  | { success: false; error: string };

export type ProjectsResponse = { ok: boolean; data?: any; error?: string };

export type MemoryDashboardResponse =
  | { success: true; [k: string]: any }
  | { success: false; error: string; memories?: any[]; total_count?: number };

export type NotificationsHistoryResponse = { notifications: any[]; guid: string; count: number };

export type NotificationsClearResponse = { success: boolean; message?: string; error?: string };

export type UploadWorkDirFilesResponse = {
  message: string;
  data: any;
  successful: string[];
  failed: string[];
};

export type DeleteWorkDirFileResponse = { data: any };

export type GetWorkDirFilesResponse = { data: any };

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
export type ChatExportResponse = { message: string; ctxid: string; content: any };
export type ChatLoadResponse = { message: string; ctxids: string[] };
export type ChatFilesPathResponse = { ok: boolean; path?: string; error?: string };

export type McpServersStatusResponse = { success: boolean; status?: any; error?: string };
export type McpServersApplyResponse = { success: boolean; status?: any; error?: string };

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

export const agentZeroApi = {
  // ... existing methods
  tunnelStatus(): Promise<TunnelStatusResponse> {
    return callJsonApi<TunnelStatusResponse>("/tunnel_proxy", { action: "get" });
  },

  tunnelCreate(provider: string = "serveo", port?: number): Promise<TunnelStatusResponse> {
    return callJsonApi<TunnelStatusResponse>("/tunnel_proxy", { action: "create", provider, port });
  },

  tunnelStop(): Promise<TunnelStatusResponse> {
    return callJsonApi<TunnelStatusResponse>("/tunnel_proxy", { action: "stop" });
  },

  tunnelVerify(url: string): Promise<TunnelStatusResponse> {
    return callJsonApi<TunnelStatusResponse>("/tunnel_proxy", { action: "verify", url });
  },
  health(): Promise<HealthResponse> {
    return callJsonApi<HealthResponse>("/health", null);
  },

  settingsGet(): Promise<SettingsGetResponse> {
    return fetchApi("/settings_get", { method: "GET" }).then(async (r) => (await r.json()) as SettingsGetResponse);
  },

  settingsSet(settingsPayload: any): Promise<SettingsSetResponse> {
    return callJsonApi<SettingsSetResponse>("/settings_set", settingsPayload);
  },

  chatCreate(args: { current_context?: string; new_context?: string }): Promise<ChatCreateResponse> {
    return callJsonApi<ChatCreateResponse>("/chat_create", {
      current_context: args.current_context || "",
      new_context: args.new_context || undefined,
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

  chatLoad(chats: any[]): Promise<ChatLoadResponse> {
    return callJsonApi<ChatLoadResponse>("/chat_load", { chats });
  },

  chatFilesPathGet(ctxid: string): Promise<ChatFilesPathResponse> {
    return callJsonApi<ChatFilesPathResponse>("/chat_files_path_get", { ctxid });
  },

  projects(action: string, payload: Record<string, any> = {}): Promise<ProjectsResponse> {
    return callJsonApi<ProjectsResponse>("/projects", { action, ...payload });
  },

  memoryDashboard(action: string, payload: Record<string, any> = {}): Promise<MemoryDashboardResponse> {
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

  schedulerTaskCreate(payload: any): Promise<SchedulerTaskResponse> {
    return callJsonApi<SchedulerTaskResponse>("/scheduler_task_create", payload);
  },

  schedulerTaskUpdate(payload: any): Promise<any> {
    return callJsonApi<any>("/scheduler_task_update", payload);
  },

  schedulerTaskDelete(payload: any): Promise<any> {
    return callJsonApi<any>("/scheduler_task_delete", payload);
  },

  schedulerTaskRun(payload: any): Promise<any> {
    return callJsonApi<any>("/scheduler_task_run", payload);
  },

  schedulerTick(payload: any): Promise<any> {
    return callJsonApi<any>("/scheduler_tick", payload);
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
      const err = await res.text();
      throw new Error(err);
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
    metadata: any;
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
    metadata: any;
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
    for (const f of args.files) {
      formData.append("files[]", f);
    }

    const res = await fetchApi("/upload_work_dir_files", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
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
      const err = await res.text();
      throw new Error(err);
    }

    return await res.blob();
  },

  mcpServersStatus(): Promise<McpServersStatusResponse> {
    return callJsonApi<McpServersStatusResponse>("/mcp_servers_status", null);
  },

  mcpServersApply(mcp_servers: any): Promise<McpServersApplyResponse> {
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
};
