import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

export type FirebaseUser = {
  email: string;
  username: string;
  role: string;
  blocked: boolean;
  localId?: number;
};

export async function getFirebaseUserByEmail(
  email: string,
): Promise<{ success: true; user: FirebaseUser } | { success: false; message: string }> {
  try {
    const docId = email.replace(/[^a-zA-Z0-9._-]/g, '_');
    const docRef = doc(db, 'users', docId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, message: 'Utilisateur non trouvé dans Firestore' };
    }

    const data = docSnap.data() as Record<string, unknown>;

    return {
      success: true,
      user: {
        email: typeof data.email === 'string' ? data.email : email,
        username: typeof data.username === 'string' ? data.username : 'Utilisateur',
        role: typeof data.role === 'string' ? data.role : 'USER',
        blocked: typeof data.blocked === 'boolean' ? data.blocked : false,
        localId: typeof data.localId === 'number' ? data.localId : undefined,
      },
    };
  } catch (e) {
    console.error('[firestore] getFirebaseUserByEmail failed', e);
    return { success: false, message: e instanceof Error ? e.message : 'Erreur Firestore' };
  }
}
