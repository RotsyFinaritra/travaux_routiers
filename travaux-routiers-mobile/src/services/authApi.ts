import { signInWithEmailAndPassword } from 'firebase/auth';
import type { FirebaseError } from 'firebase/app';
import { auth } from '@/firebase';
import { apiFetch, ApiError } from '@/lib/apiClient';

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

const STORAGE_KEY = 'travaux.auth.user';

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

function messageFromError(error: unknown): string {
  if (error instanceof ApiError) {
    if (typeof error.payload === 'string' && error.payload.trim()) return error.payload;
    if (error.payload && typeof error.payload === 'object') {
      const maybe = error.payload as { message?: unknown; error?: unknown };
      if (typeof maybe.message === 'string' && maybe.message.trim()) return maybe.message;
      if (typeof maybe.error === 'string' && maybe.error.trim()) return maybe.error;
    }
    return error.message;
  }
  if (error && typeof error === 'object' && 'code' in error) {
    const fb = error as FirebaseError;
    switch (fb.code) {
      case 'auth/invalid-credential':
      case 'auth/invalid-login-credentials':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Email ou mot de passe incorrect';
      case 'auth/invalid-email':
        return 'Adresse email invalide';
      case 'auth/too-many-requests':
        return 'Trop de tentatives. Réessayez plus tard';
      case 'auth/network-request-failed':
        return 'Problème réseau. Vérifiez votre connexion';
      default:
        return fb.message || 'Erreur Firebase';
    }
  }
  return error instanceof Error ? error.message : 'Erreur inconnue';
}

/**
 * Firebase login (client) + Spring Boot cloud-profile login (server).
 *
 * Flow:
 * 1) Firebase sign-in with email/password
 * 2) Get Firebase ID token
 * 3) POST /api/auth/login with { idToken }
 */
export async function loginFirebase(email: string, password: string): Promise<AuthResponse> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await cred.user.getIdToken();

    const resp = await apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      data: { idToken },
    });

    saveAuthUser(resp);
    return resp;
  } catch (e) {
    return { success: false, message: messageFromError(e) };
  }
}

export function logout(): void {
  localStorage.removeItem(STORAGE_KEY);
  auth.signOut();
}
