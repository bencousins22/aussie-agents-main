/* eslint-disable @typescript-eslint/no-explicit-any */

import type { PollResponse } from "./types";

// Get API base URL and API key from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const API_KEY = import.meta.env.VITE_API_KEY || '';

export async function fetchApi(url: string, init?: RequestInit): Promise<Response> {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  
  const finalInit: RequestInit = init ? { ...init } : {};
  const headers = new Headers(finalInit.headers || undefined);
  
  // Add API key header if available
  if (API_KEY) {
    headers.set("X-API-KEY", API_KEY);
  }
  
  // For cross-origin requests, we need to handle credentials carefully
  // When using API key auth, we don't need session cookies
  finalInit.headers = headers;
  finalInit.mode = "cors";
  
  // Only include credentials if we're not using API key (for local development)
  if (!API_KEY) {
    finalInit.credentials = "include";
  }

  const res = await fetch(fullUrl, finalInit);

  // Handle authentication errors
  if (res.status === 401) {
    const errorText = await res.text();
    throw new Error(`Authentication failed: ${errorText}`);
  }

  if (res.status === 403) {
    const errorText = await res.text();
    throw new Error(`Access denied: ${errorText}`);
  }

  return res;
}

export async function callJsonApi<T>(endpoint: string, data: any): Promise<T> {
  const response = await fetchApi(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return (await response.json()) as T;
}

export async function poll(args: {
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
}

export async function sendMessageAsync(args: {
  context: string | null;
  messageId: string;
  text: string;
  attachments: File[];
}): Promise<{ message: string; context: string }> {
  if (args.attachments.length > 0) {
    const formData = new FormData();
    formData.append("text", args.text);
    formData.append("context", args.context || "");
    formData.append("message_id", args.messageId);
    for (const file of args.attachments) {
      formData.append("attachments", file);
    }

    const res = await fetchApi("/message_async", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }

    return (await res.json()) as { message: string; context: string };
  }

  const res = await fetchApi("/message_async", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: args.text,
      context: args.context,
      message_id: args.messageId,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }

  return (await res.json()) as { message: string; context: string };
}
