/* eslint-disable @typescript-eslint/no-explicit-any */

import type { PollResponse } from "./types";

let csrfToken: string | null = null;

async function getCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;

  const response = await fetch("/csrf_token", {
    credentials: "same-origin",
  });

  if (response.redirected && response.url.endsWith("/login")) {
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
    throw new Error("Redirected to login");
  }

  const json = (await response.json()) as { ok: boolean; token?: string; error?: string; runtime_id?: string };

  if (!json.ok || !json.token) {
    throw new Error(json.error || "Failed to get CSRF token");
  }

  csrfToken = json.token;
  if (json.runtime_id) {
    document.cookie = `csrf_token_${json.runtime_id}=${csrfToken}; SameSite=Strict; Path=/`;
  }
  return csrfToken;
}

export async function fetchApi(url: string, init?: RequestInit): Promise<Response> {
  async function wrap(retry: boolean): Promise<Response> {
    const token = await getCsrfToken();

    const finalInit: RequestInit = init ? { ...init } : {};
    const headers = new Headers(finalInit.headers || undefined);
    headers.set("X-CSRF-Token", token);
    finalInit.headers = headers;

    const res = await fetch(url, finalInit);

    if (res.status === 403 && retry) {
      csrfToken = null;
      return wrap(false);
    }

    if (res.redirected && res.url.endsWith("/login")) {
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      throw new Error("Redirected to login");
    }

    return res;
  }

  return wrap(true);
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
