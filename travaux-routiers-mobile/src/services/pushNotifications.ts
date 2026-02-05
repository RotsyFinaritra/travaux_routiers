import { PushNotifications, type Token } from '@capacitor/push-notifications';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { getCurrentFirebaseUser } from './firebaseAuth';

export async function registerPushNotifications() {
  const user = getCurrentFirebaseUser();
  if (!user) {
    console.warn('[push] No authenticated user, skipping registration');
    return;
  }

  try {
    // Request permission
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.warn('[push] Push notification permission denied');
      return;
    }

    // Register with FCM
    await PushNotifications.register();

    console.log('[push] Registration successful');
  } catch (e) {
    console.error('[push] Registration failed', e);
  }
}

export async function setupPushNotificationListeners() {
  // Notification received while app is in foreground
  await PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('[push] Notification received:', notification);
    // You can show a custom alert or toast here
  });

  // Notification action performed (user tapped on it)
  await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    console.log('[push] Notification action performed:', notification);
    // You can navigate to a specific screen here based on notification.data
  });

  // Registration successful - save token to Firestore
  await PushNotifications.addListener('registration', async (token: Token) => {
    console.log('[push] Registration token:', token.value);
    await savePushTokenToFirestore(token.value);
  });

  // Registration failed
  await PushNotifications.addListener('registrationError', (error) => {
    console.error('[push] Registration error:', error);
  });
}

async function savePushTokenToFirestore(token: string) {
  const user = getCurrentFirebaseUser();
  if (!user) {
    console.warn('[push] No authenticated user, cannot save token');
    return;
  }

  try {
    const tokenDoc = doc(db, 'user_tokens', user.uid);
    await setDoc(tokenDoc, {
      token,
      userUid: user.uid,
      platform: 'android',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('[push] Token saved to Firestore');
  } catch (e) {
    console.error('[push] Failed to save token to Firestore', e);
  }
}

export async function removePushToken() {
  const user = getCurrentFirebaseUser();
  if (!user) return;

  try {
    const tokenDoc = doc(db, 'user_tokens', user.uid);
    await deleteDoc(tokenDoc);
    console.log('[push] Token removed from Firestore');
  } catch (e) {
    console.error('[push] Failed to remove token', e);
  }
}
