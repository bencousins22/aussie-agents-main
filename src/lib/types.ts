import { 
  AgentLogEntrySchema, 
  AgentContextSummarySchema, 
  AgentTaskSummarySchema, 
  AgentNotificationSchema, 
  PollResponseSchema 
} from "./schemas";
import { z } from "zod";

export type AgentLogType = string;

export type AgentLogEntry = z.infer<typeof AgentLogEntrySchema>;
export type AgentContextSummary = z.infer<typeof AgentContextSummarySchema>;
export type AgentTaskSummary = z.infer<typeof AgentTaskSummarySchema>;
export type AgentNotification = z.infer<typeof AgentNotificationSchema>;
export type PollResponse = z.infer<typeof PollResponseSchema>;
