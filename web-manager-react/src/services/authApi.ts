import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase";
import { apiFetch, ApiError } from "../lib/apiClient";

export type AuthMode = "firebase" | "local";

export type AuthResponse = {
  success: boolean;
  message?: string;
  userId?: number;
  username?: string;
  email?: string;
};

export type LoginInput = {
  usernameOrEmail: string;
  password: string;
};

export type RegisterInput = {
  username: string;
  email: string;
  password: string;
};

const STORAGE_KEY = "travaux.auth.user";

export function getAuthMode(): AuthMode {
  const raw = (import.meta.env.VITE_AUTH_MODE as string | undefined)?.toLowerCase();
  if (raw === "local") return "local";
  return "firebase";
}

export function saveAuthUser(resp: AuthResponse): void {
  if (!resp.success) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(resp));
}

export function loadAuthUser(): AuthResponse | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthResponse;
  } catch {
    return null;
  }
}

export function clearAuthUser(): void {
  localStorage.removeItem(STORAGE_KEY);
}

function messageFromError(error: unknown): string {
  if (error instanceof ApiError) {
    if (typeof error.payload === "string" && error.payload.trim()) return error.payload;
    return error.message;
  }
  return error instanceof Error ? error.message : "Erreur inconnue";
}

/**
 * Login against backend.
 * - firebase mode: signs in with Firebase, then calls `/auth/login` with `{ idToken }`.
 * - local mode: calls `/auth/login` with `{ usernameOrEmail, password }`.
 */
export async function login(input: LoginInput): Promise<AuthResponse> {
  const mode = getAuthMode();

  try {
    if (mode === "firebase") {
      const cred = await signInWithEmailAndPassword(auth, input.usernameOrEmail, input.password);
      const idToken = await cred.user.getIdToken();

      const resp = await apiFetch<AuthResponse>("/auth/login", {
        method: "POST",
        data: { idToken },
      });
      saveAuthUser(resp);
      return resp;
    }

    const resp = await apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      data: { usernameOrEmail: input.usernameOrEmail, password: input.password },
    });
    saveAuthUser(resp);
    return resp;
  } catch (error) {
    return { success: false, message: messageFromError(error) };
  }
}

/**
 * Register a user.
 * - firebase mode: creates Firebase account, sets displayName, then calls backend login to create mirror.
 * - local mode: calls `/auth/register`.
 */
export async function register(input: RegisterInput): Promise<AuthResponse> {
  const mode = getAuthMode();

  try {
    if (mode === "firebase") {
      const cred = await createUserWithEmailAndPassword(auth, input.email, input.password);
      await updateProfile(cred.user, { displayName: input.username });
      const idToken = await cred.user.getIdToken(true);

      const resp = await apiFetch<AuthResponse>("/auth/login", {
        method: "POST",
        data: { idToken },
      });
      saveAuthUser(resp);
      return resp;
    }

    const resp = await apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      data: { username: input.username, email: input.email, password: input.password },
    });
    saveAuthUser(resp);
    return resp;
  } catch (error) {
    return { success: false, message: messageFromError(error) };
  }
}
