import type { FirebaseError } from 'firebase/app';
import {
  addDoc,
  collection,
  getDocs,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage'; // Ajout pour Storage
import { db } from '@/firebase';
import { getCurrentFirebaseUser } from '@/services/firebaseAuth';

export type FirebaseSignalement = {
  id: string;
  latitude: number;
  longitude: number;
  description: string;
  statusName: string;
  validationStatusName: string;
  userUid: string;
  userEmail?: string | null;
  userDisplayName?: string | null;
  surfaceArea?: number | null;
  budget?: number | null;
  photoUrl?: string | null; // Ancien champ pour compatibilité
  photoUrls?: string[] | null; // Nouveau champ pour multiples photos
  createdAt?: Date | null;
  syncedToLocalAt?: Date | null;
  localId?: number | null;
};

export type CreateFirebaseSignalementInput = {
  latitude: number;
  longitude: number;
  description: string;
  surfaceArea?: number | null;
  budget?: number | null;
  photoUrls?: string[] | null; // Changement : tableau d'URLs
};

function messageFromFirestoreError(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const fb = error as FirebaseError;
    switch (fb.code) {
      case 'permission-denied':
        return 'Accès refusé (règles Firestore).';
      case 'unauthenticated':
        return 'Non connecté.';
      case 'unavailable':
        return 'Service indisponible. Vérifiez la connexion.';
      case 'failed-precondition':
        return 'Précondition invalide (index/règle).';
      default:
        return fb.message || 'Erreur Firestore';
    }
  }
  return error instanceof Error ? error.message : 'Erreur Firestore';
}

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();
  return null;
}

// Nouvelle fonction : Upload une photo (data URL) vers Firebase Storage et retourne l'URL de téléchargement
export async function uploadPhotoToStorage(dataUrl: string): Promise<string> {
  try {
    const storage = getStorage();
    const fileName = `signalements/photos/${Date.now()}_${Math.random().toString(36).substring(2)}.jpg`;
    const fileRef = ref(storage, fileName);
    await uploadString(fileRef, dataUrl, 'data_url');
    return await getDownloadURL(fileRef);
  } catch (error) {
    console.error('[storage] Upload photo failed', error);
    throw new Error('Erreur lors de l\'upload de la photo');
  }
}

export async function listFirebaseSignalements(): Promise<
  { success: true; signalements: FirebaseSignalement[] } | { success: false; message: string }
> {
  try {
    const q = query(collection(db, 'signalements'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);

    const out: FirebaseSignalement[] = [];
    snap.forEach((doc) => {
      const data = doc.data() as Record<string, unknown>;

      const latitude = typeof data.latitude === 'number' ? data.latitude : Number(data.latitude);
      const longitude = typeof data.longitude === 'number' ? data.longitude : Number(data.longitude);
      const description = typeof data.description === 'string' ? data.description : '';

      // Changement : Gestion de photoUrls et compatibilité avec photoUrl
      let photoUrls: string[] | null = null;
      if (Array.isArray(data.photoUrls)) {
        photoUrls = data.photoUrls as string[];
      } else if (typeof data.photoUrl === 'string' && data.photoUrl.trim()) {
        photoUrls = [data.photoUrl];
      }

      out.push({
        id: doc.id,
        latitude,
        longitude,
        description,
        statusName: typeof data.statusName === 'string' ? data.statusName : 'NOUVEAU',
        validationStatusName:
          typeof data.validationStatusName === 'string' ? data.validationStatusName : 'PENDING',
        userUid: typeof data.userUid === 'string' ? data.userUid : '',
        userEmail: typeof data.userEmail === 'string' ? data.userEmail : null,
        userDisplayName: typeof data.userDisplayName === 'string' ? data.userDisplayName : null,
        surfaceArea:
          typeof data.surfaceArea === 'number'
            ? data.surfaceArea
            : data.surfaceArea != null
              ? Number(data.surfaceArea)
              : null,
        budget:
          typeof data.budget === 'number' ? data.budget : data.budget != null ? Number(data.budget) : null,
        photoUrl: typeof data.photoUrl === 'string' ? data.photoUrl : null, // Ancien
        photoUrls, // Nouveau
        createdAt: toDate(data.createdAt),
        syncedToLocalAt: toDate(data.syncedToLocalAt),
        localId: typeof data.localId === 'number' ? data.localId : null,
      });
    });

    return {
      success: true,
      signalements: out.filter(
        (s) => Number.isFinite(s.latitude) && Number.isFinite(s.longitude),
      ),
    };
  } catch (e) {
    console.error('[firestore] list signalements failed', e);
    return { success: false, message: messageFromFirestoreError(e) };
  }
}

export function subscribeFirebaseSignalements(
  onData: (signalements: FirebaseSignalement[]) => void,
  onError?: (message: string, rawError: unknown) => void,
): () => void {
  const q = query(collection(db, 'signalements'), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snap) => {
      const out: FirebaseSignalement[] = [];
      snap.forEach((doc) => {
        const data = doc.data() as Record<string, unknown>;

        const latitude = typeof data.latitude === 'number' ? data.latitude : Number(data.latitude);
        const longitude =
          typeof data.longitude === 'number' ? data.longitude : Number(data.longitude);
        const description = typeof data.description === 'string' ? data.description : '';

        // Changement : Gestion de photoUrls et compatibilité avec photoUrl
        let photoUrls: string[] | null = null;
        if (Array.isArray(data.photoUrls)) {
          photoUrls = data.photoUrls as string[];
        } else if (typeof data.photoUrl === 'string' && data.photoUrl.trim()) {
          photoUrls = [data.photoUrl];
        }

        out.push({
          id: doc.id,
          latitude,
          longitude,
          description,
          statusName: typeof data.statusName === 'string' ? data.statusName : 'NOUVEAU',
          validationStatusName:
            typeof data.validationStatusName === 'string' ? data.validationStatusName : 'PENDING',
          userUid: typeof data.userUid === 'string' ? data.userUid : '',
          userEmail: typeof data.userEmail === 'string' ? data.userEmail : null,
          userDisplayName: typeof data.userDisplayName === 'string' ? data.userDisplayName : null,
          surfaceArea:
            typeof data.surfaceArea === 'number'
              ? data.surfaceArea
              : data.surfaceArea != null
                ? Number(data.surfaceArea)
                : null,
          budget:
            typeof data.budget === 'number' ? data.budget : data.budget != null ? Number(data.budget) : null,
          photoUrl: typeof data.photoUrl === 'string' ? data.photoUrl : null, // Ancien
          photoUrls, // Nouveau
          createdAt: toDate(data.createdAt),
          syncedToLocalAt: toDate(data.syncedToLocalAt),
          localId: typeof data.localId === 'number' ? data.localId : null,
        });
      });

      onData(
        out.filter((s) => Number.isFinite(s.latitude) && Number.isFinite(s.longitude)),
      );
    },
    (err) => {
      console.error('[firestore] subscribe signalements failed', err);
      onError?.(messageFromFirestoreError(err), err);
    },
  );
}

export async function createFirebaseSignalement(
  input: CreateFirebaseSignalementInput,
): Promise<{ success: true; id: string } | { success: false; message: string }> {
  const user = getCurrentFirebaseUser();
  if (!user) return { success: false, message: 'Veuillez vous connecter.' };

  const description = input.description.trim();
  if (description.length < 4) return { success: false, message: 'Description trop courte.' };

  try {
    // Helpful debug info when running on device.
    console.info('[firestore] creating signalement', {
      uid: user.uid,
      latitude: input.latitude,
      longitude: input.longitude,
      descriptionLength: description.length,
    });

    try {
      const idToken = await user.getIdToken();
      console.info('[firestore] current user idToken (prefix):', idToken?.substring?.(0, 40) + '...');
    } catch (tokErr) {
      console.warn('[firestore] failed to read idToken', tokErr);
    }

    const docRef = await addDoc(collection(db, 'signalements'), {
      source: 'mobile',
      userUid: user.uid,
      userEmail: user.email ?? null,
      userDisplayName: user.displayName ?? null,
      latitude: input.latitude,
      longitude: input.longitude,
      description,
      statusName: 'NOUVEAU',
      validationStatusName: 'PENDING',
      surfaceArea: input.surfaceArea ?? null,
      budget: input.budget ?? null,
      photoUrls: input.photoUrls ?? null, // Changement : tableau d'URLs
      createdAt: Timestamp.now(),
      createdAtServer: serverTimestamp(),
      syncedToLocalAt: null,
      localId: null,
    });

    console.log('[firestore] write completed, waiting 3s...');
    setTimeout(() => console.log('[firestore] check console now'), 3000);

    // Confirm the document exists locally / server-side
    try {
      const written = await getDoc(docRef);
      if (!written.exists()) {
        console.warn('[firestore] created doc not readable after write (possible security rules).', { id: docRef.id });
        return { success: false, message: 'Signalement créé, mais lecture refusée par les règles Firestore.' };
      }
    } catch (rerr) {
      console.error('[firestore] read-after-write failed', rerr);
      return { success: false, message: messageFromFirestoreError(rerr) };
    }

    console.info('[firestore] created signalement', { id: docRef.id });
    return { success: true, id: docRef.id };
  } catch (e) {
    console.error('[firestore] create signalement failed', e);
    return { success: false, message: messageFromFirestoreError(e) };
  }
}