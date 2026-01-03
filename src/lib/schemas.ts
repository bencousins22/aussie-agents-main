import { z } from "zod";

export const AgentLogTypeSchema = z.string();

export const AgentLogEntrySchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  no: z.number().optional(),
  type: AgentLogTypeSchema,
  heading: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  temp: z.boolean().optional(),
  receivedAt: z.number().optional(),
  kvps: z.record(z.string(), z.unknown()).optional().nullable(),
});

export const AgentContextSummarySchema = z.object({
  id: z.string(),
  name: z.string().optional().nullable(),
  created_at: z.number().optional().nullable(),
  updated_at: z.number().optional().nullable(),
}).passthrough();

export const AgentTaskSummarySchema = AgentContextSummarySchema.extend({
  task_name: z.string().optional().nullable(),
  uuid: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  last_run: z.unknown().optional(),
  last_result: z.unknown().optional(),
  attachments: z.array(z.string()).optional().nullable(),
  schedule: z.unknown().optional(),
  plan: z.unknown().optional(),
  token: z.string().optional().nullable(),
}).passthrough();

export const AgentNotificationSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  no: z.number().optional(),
  type: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  message: z.string().optional().nullable(),
}).passthrough();

export const PollResponseSchema = z.object({
  deselect_chat: z.boolean().optional(),
  context: z.string().optional().nullable(),
  contexts: z.array(AgentContextSummarySchema).optional().default([]),
  tasks: z.array(AgentTaskSummarySchema).optional().default([]),
  logs: z.array(AgentLogEntrySchema).optional().default([]),
  log_guid: z.string().optional().nullable(),
  log_version: z.number().optional().default(0),
  log_progress: z.number().optional().default(0),
  log_progress_active: z.boolean().optional().default(false),
  paused: z.boolean().optional().default(false),
  notifications: z.array(AgentNotificationSchema).optional().default([]),
  notifications_guid: z.string().optional().nullable(),
  notifications_version: z.number().optional().default(0),
});

export type AgentLogEntry = z.infer<typeof AgentLogEntrySchema>;
export type AgentContextSummary = z.infer<typeof AgentContextSummarySchema>;
export type AgentTaskSummary = z.infer<typeof AgentTaskSummarySchema>;
export type AgentNotification = z.infer<typeof AgentNotificationSchema>;
export type PollResponse = z.infer<typeof PollResponseSchema>;
