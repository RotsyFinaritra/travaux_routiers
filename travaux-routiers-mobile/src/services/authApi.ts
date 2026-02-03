import { signInWithEmailAndPassword } from 'firebase/auth';
import type { FirebaseError } from 'firebase/app';
import { auth } from '@/firebase';
import { getFirebaseUserByEmail } from './firebaseUsers';

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
 * Firebase login (client) + Firestore user info.
 *
 * Flow:
 * 1) Firebase sign-in with email/password
 * 2) Get user info from Firestore collection 'users'
 * 3) Check if user is blocked
 */
export async function loginFirebase(email: string, password: string): Promise<AuthResponse> {
  try {
    // 1. Authenticate with Firebase
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await cred.user.getIdToken();

    // 2. Get user metadata from Firestore
    const userResult = await getFirebaseUserByEmail(email);
    if (!userResult.success) {
      await auth.signOut();
      return { success: false, message: userResult.message };
    }

    const user = userResult.user;

    // 3. Check if user is blocked
    if (user.blocked) {
      await auth.signOut();
      return { success: false, message: 'Compte bloqué. Contactez un administrateur.' };
    }

    // 4. Build response
    const resp: AuthResponse = {
      success: true,
      userId: user.localId,
      username: user.username,
      email: user.email,
      typeName: user.role,
      token: idToken,
      blocked: user.blocked,
    };

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
