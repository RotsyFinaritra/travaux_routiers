import type { FirebaseError } from 'firebase/app';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/firebase';

export type FirebaseAuthResult =
  | { success: true; user: User }
  | { success: false; message: string };

function messageFromFirebaseError(error: unknown): string {
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

export async function loginFirebaseOnly(email: string, password: string): Promise<FirebaseAuthResult> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: cred.user };
  } catch (e) {
    return { success: false, message: messageFromFirebaseError(e) };
  }
}

export async function logoutFirebase(): Promise<void> {
  await signOut(auth);
}

/** Resolves once Firebase Auth finished restoring the session. */
export function waitForAuthReady(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user);
    });
  });
}

export function getCurrentFirebaseUser(): User | null {
  return auth.currentUser;
}
