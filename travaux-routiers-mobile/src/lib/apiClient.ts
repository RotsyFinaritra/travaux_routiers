export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

function getBaseUrl(): string {
  // Example: http://localhost:8080/api
  const raw = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';
  return raw.replace(/\/$/, '');
}

export async function apiFetch<T>(path: string, options?: {
  method?: string;
  data?: unknown;
  headers?: Record<string, string>;
}): Promise<T> {
  const base = getBaseUrl();
  if (!base) {
    throw new ApiError('Missing VITE_API_BASE_URL', 0, null);
  }

  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const method = options?.method ?? 'GET';

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options?.headers ?? {}),
  };

  let body: string | undefined;
  if (options?.data !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.data);
  }

  const res = await fetch(url, { method, headers, body });

  const text = await res.text();
  const payload = text ? safeJsonParse(text) : null;

  if (!res.ok) {
    const message =
      payload && typeof payload === 'object' && 'message' in (payload as any)
        ? String((payload as any).message)
        : `HTTP ${res.status}`;
    throw new ApiError(message, res.status, payload);
  }

  return payload as T;
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
