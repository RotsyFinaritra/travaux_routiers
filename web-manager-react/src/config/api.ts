const DEFAULT_API_BASE_URL = "http://localhost:8081";

function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

function normalizePath(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "/";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

/**
 * Base URL of the Spring Boot server (no trailing slash).
 * Configure with Vite env var: VITE_API_BASE_URL
 */
export const API_BASE_URL = normalizeBaseUrl(
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? DEFAULT_API_BASE_URL,
);

/**
 * API prefix path mounted by the backend.
 * Defaults to `/api`.
 */
export const API_PREFIX = normalizePath(
  (import.meta.env.VITE_API_PREFIX as string | undefined) ?? "/api",
);

/**
 * Build a full API URL from a path.
 * - `apiUrl("/auth/login")` -> `${API_BASE_URL}${API_PREFIX}/auth/login`
 * - If `path` is already an absolute URL, returns it unchanged.
 */
export function apiUrl(path: string): string {
  const trimmed = path.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const normalized = normalizePath(trimmed);
  return `${API_BASE_URL}${API_PREFIX}${normalized}`;
}
