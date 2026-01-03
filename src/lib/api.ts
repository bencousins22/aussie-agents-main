import { PollResponseSchema } from "./schemas";
import type { PollResponse } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const API_KEY = import.meta.env.VITE_API_KEY || '';

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: Response
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const defaultHeaders = new Headers({
  'Content-Type': 'application/json',
});

if (API_KEY) {
  defaultHeaders.set('X-API-KEY', API_KEY);
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 30000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408);
    }
    throw error;
  }
}

export async function fetchApi(url: string, init: RequestInit = {}): Promise<Response> {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  
  const headers = new Headers(init.headers);
  if (API_KEY) {
    headers.set('X-API-KEY', API_KEY);
  }

  const options: RequestInit = {
    ...init,
    headers,
    mode: 'cors',
    credentials: API_KEY ? 'omit' : 'include',
  };

  const response = await fetchWithTimeout(fullUrl, options);

  if (response.status === 401) {
    throw new ApiError('Authentication failed', 401, response);
  }

  if (response.status === 403) {
    throw new ApiError('Access denied', 403, response);
  }

  if (!response.ok && response.status >= 500) {
    throw new ApiError(`Server error: ${response.statusText}`, response.status, response);
  }

  return response;
}

export async function callJsonApi<T>(endpoint: string, data: unknown): Promise<T> {
  const response = await fetchApi(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(errorText || response.statusText, response.status, response);
  }

  return await response.json() as T;
}

export async function poll(args: {
  context: string | null;
  logFrom: number;
  notificationsFrom: number;
}): Promise<PollResponse> {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  const rawData = await callJsonApi<unknown>('/poll', {
    log_from: args.logFrom,
    notifications_from: args.notificationsFrom,
    context: args.context,
    timezone,
  });

  return PollResponseSchema.parse(rawData);
}

export async function sendMessageAsync(args: {
  context: string | null;
  messageId: string;
  text: string;
  attachments: File[];
}): Promise<{ message: string; context: string }> {
  let response: Response;

  if (args.attachments.length > 0) {
    const formData = new FormData();
    formData.append('text', args.text);
    formData.append('context', args.context || '');
    formData.append('message_id', args.messageId);
    
    args.attachments.forEach(file => {
      formData.append('attachments', file);
    });

    response = await fetchApi('/message_async', {
      method: 'POST',
      body: formData,
    });
  } else {
    response = await fetchApi('/message_async', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: args.text,
        context: args.context,
        message_id: args.messageId,
      }),
    });
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(errorText || response.statusText, response.status, response);
  }

  return await response.json() as { message: string; context: string };
}

export { ApiError };
