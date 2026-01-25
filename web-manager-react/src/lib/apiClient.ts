import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from "axios";
import { auth } from "../firebase";
import { API_BASE_URL, API_PREFIX } from "../config/api";

export class ApiError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

function normalizeBase(value: string): string {
  return value.replace(/\/+$/, "");
}

function normalizePrefix(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed === "/") return "";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

const baseURL = `${normalizeBase(API_BASE_URL)}${normalizePrefix(API_PREFIX)}`;

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    Accept: "application/json",
  },
});

const LOCAL_AUTH_STORAGE_KEY = "travaux.auth.user";

function getAuthMode(): "firebase" | "local" {
  const raw = (import.meta.env.VITE_AUTH_MODE as string | undefined)?.toLowerCase();
  if (raw === "local") return "local";
  return "firebase";
}

function getLocalJwt(): string | null {
  const raw = localStorage.getItem(LOCAL_AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { token?: unknown; tokenExp?: unknown };
    const token = typeof parsed.token === "string" ? parsed.token : null;
    if (!token) return null;
    const exp = typeof parsed.tokenExp === "number" ? parsed.tokenExp : null;
    if (exp && exp * 1000 <= Date.now()) return null;
    return token;
  } catch {
    return null;
  }
}

// Attach auth automatically:
// - firebase mode: use Firebase ID token (if available)
// - local mode: use backend JWT stored in localStorage
apiClient.interceptors.request.use(async (config) => {
  config.headers = config.headers ?? {};
  if (config.headers.Authorization) return config;

  const mode = getAuthMode();
  if (mode === "local") {
    const token = getLocalJwt();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  }

  const user = auth.currentUser;
  if (!user) return config;

  const token = await user.getIdToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function extractMessage(payload: unknown): string | null {
  if (typeof payload === "string") return payload;
  if (payload && typeof payload === "object") {
    const maybe = payload as { message?: unknown; error?: unknown };
    if (typeof maybe.message === "string" && maybe.message.trim()) return maybe.message;
    if (typeof maybe.error === "string" && maybe.error.trim()) return maybe.error;
  }
  return null;
}

function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status ?? 0;
    const payload = axiosError.response?.data ?? null;
    const messageFromPayload = extractMessage(payload);
    const message =
      messageFromPayload ??
      axiosError.message ??
      (status ? `API request failed (${status})` : "API request failed");
    return new ApiError(message, status, payload);
  }

  const message = error instanceof Error ? error.message : "API request failed";
  return new ApiError(message, 0, null);
}

/**
 * Typed JSON helper for calling the backend through Axios.
 *
 * Example:
 *   const me = await apiFetch<User>("/users/me", { method: "GET" });
 */
export async function apiFetch<T>(
  path: string,
  config: AxiosRequestConfig = {},
): Promise<T> {
  try {
    const response = await apiClient.request<T>({
      url: path,
      ...config,
    });
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}
