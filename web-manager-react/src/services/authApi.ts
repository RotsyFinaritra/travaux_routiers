import type { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase";
import { ApiError, apiFetch } from "../lib/apiClient";

export type AuthMode = "firebase" | "local";

export type AuthResponse = {
  success: boolean;
  message?: string;
  userId?: number;
  username?: string;
  email?: string;
  typeName?: string;
  token?: string;
  tokenExp?: number;
  blocked?: boolean;
  remainingAttempts?: number;
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

/**
 * Logout current user.
 * - firebase mode: sign out from Firebase
 * - always: clear local cached user
 */
export async function logout(): Promise<void> {
  const mode = getAuthMode();
  clearAuthUser();
  if (mode === "firebase") {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
  }
}

function messageFromError(error: unknown): string {
  if (error instanceof ApiError) {
    if (typeof error.payload === "string" && error.payload.trim()) return error.payload;
    if (error.payload && typeof error.payload === "object") {
      const maybe = error.payload as { message?: unknown; error?: unknown };
      if (typeof maybe.message === "string" && maybe.message.trim()) return maybe.message;
      if (typeof maybe.error === "string" && maybe.error.trim()) return maybe.error;
    }
    return error.message;
  }
  if (error && typeof error === "object" && "code" in error) {
    const fb = error as FirebaseError & {
      customData?: unknown;
    };
    const code = fb.code;

    // Firebase Auth sometimes includes a token response with a more explicit message.
    // Example: { error: { message: "INVALID_PASSWORD" } }
    const tokenMsg = (() => {
      const cd = fb.customData;
      if (!cd || typeof cd !== "object") return null;
      const anyCd = cd as Record<string, unknown>;
      const tokenResp = anyCd._tokenResponse;
      if (!tokenResp || typeof tokenResp !== "object") return null;
      const anyTr = tokenResp as Record<string, unknown>;
      const err = anyTr.error;
      if (!err || typeof err !== "object") return null;
      const anyErr = err as Record<string, unknown>;
      return typeof anyErr.message === "string" ? anyErr.message : null;
    })();

    // Friendly French messages.
    switch (code) {
      case "auth/invalid-credential":
      case "auth/invalid-login-credentials":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Email ou mot de passe incorrect";
      case "auth/invalid-email":
        return "Adresse email invalide";
      case "auth/too-many-requests":
        return "Trop de tentatives. Réessayez plus tard";
      case "auth/email-already-in-use":
        return "Cet email est déjà utilisé";
      case "auth/weak-password":
        return "Mot de passe trop faible";
      case "auth/network-request-failed":
        return "Problème réseau. Vérifiez votre connexion";
      default:
        // As a fallback, return token response message if available.
        if (tokenMsg) {
          if (tokenMsg === "INVALID_PASSWORD" || tokenMsg === "EMAIL_NOT_FOUND") {
            return "Email ou mot de passe incorrect";
          }
          if (tokenMsg === "INVALID_EMAIL") {
            return "Adresse email invalide";
          }
          return tokenMsg;
        }
        break;
    }
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
      try {
        const cred = await signInWithEmailAndPassword(auth, input.usernameOrEmail, input.password);
        const idToken = await cred.user.getIdToken();

        const resp = await apiFetch<AuthResponse>("/auth/login", {
          method: "POST",
          data: { idToken, usernameOrEmail: input.usernameOrEmail },
        });
        saveAuthUser(resp);
        return resp;
      } catch (firebaseError) {
        // En cas d'échec Firebase, notifier le backend pour incrémenter login_attempts
        try {
          const resp = await apiFetch<AuthResponse>("/auth/login", {
            method: "POST",
            data: { usernameOrEmail: input.usernameOrEmail },
          });
          return { ...resp, success: false, message: messageFromError(firebaseError) };
        } catch (apiError) {
          return { success: false, message: messageFromError(firebaseError) };
        }
      }
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

/**
 * Fetch current user info from the backend.
 * Uses Authorization header from apiClient interceptor (Firebase ID token or local JWT).
 */
export async function fetchMe(): Promise<AuthResponse> {
  try {
    const resp = await apiFetch<AuthResponse>("/auth/me", { method: "GET" });
    // Keep local cache in sync when possible.
    if (resp.success) {
      const cached = loadAuthUser();
      if (cached && resp.userId && cached.userId === resp.userId) {
        saveAuthUser({ ...cached, ...resp });
      }
    }
    return resp;
  } catch (error) {
    return { success: false, message: messageFromError(error) };
  }
}
