import { apiFetch, ApiError } from '../lib/apiClient';

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
  return error instanceof Error ? error.message : 'Erreur inconnue';
}

export type FirebaseSyncResult =
  | { success: true; created: number; updated: number; skipped: number; errors: number }
  | { success: false; message: string };

export async function syncFirebaseSignalements(): Promise<FirebaseSyncResult> {
  const adminKey = import.meta.env.VITE_ADMIN_API_KEY as string | undefined;
  if (!adminKey) {
    return { success: false, message: 'VITE_ADMIN_API_KEY manquant (actions manager non configurées)' };
  }

  try {
    const resp = await apiFetch<{ success: true; created: number; updated: number; skipped: number; errors: number }>(
      '/admin/firebase/sync/signalements',
      {
        method: 'POST',
        headers: {
          'X-ADMIN-KEY': adminKey,
        },
      },
    );

    return resp;
  } catch (e) {
    return { success: false, message: messageFromError(e) };
  }
}
