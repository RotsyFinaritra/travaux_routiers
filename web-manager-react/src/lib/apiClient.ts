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

// Optional: attach Firebase ID token automatically when available.
// If you don't want this behavior, remove this interceptor.
apiClient.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (!user) return config;

  const token = await user.getIdToken();
  config.headers = config.headers ?? {};
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status ?? 0;
    const payload = axiosError.response?.data ?? null;
    const message =
      typeof payload === "string"
        ? payload
        : axiosError.message || (status ? `API request failed (${status})` : "API request failed");
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
