package com.example.travauxroutiers.service;

import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.cloud.FirestoreClient;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@Profile("cloud")
public class PushNotificationService {
    private static final Logger logger = LoggerFactory.getLogger(PushNotificationService.class);

    private final Firestore firestore;
    private final FirebaseMessaging firebaseMessaging;

    public PushNotificationService(FirebaseApp firebaseApp) {
        this.firestore = FirestoreClient.getFirestore(firebaseApp);
        this.firebaseMessaging = FirebaseMessaging.getInstance(firebaseApp);
    }

    /**
     * Send notification to a user about signalement status change
     */
    public void sendSignalementStatusChangeNotification(String userUid, Long signalementId, String oldStatus, String newStatus, String description) {
        if (userUid == null || userUid.isEmpty()) {
            logger.warn("Cannot send notification: userUid is null or empty");
            return;
        }

        try {
            // Get user's FCM token from Firestore
            DocumentSnapshot tokenDoc = firestore.collection("user_tokens").document(userUid).get().get();
            
            if (!tokenDoc.exists()) {
                logger.info("No FCM token found for user: {}", userUid);
                return;
            }

            String token = tokenDoc.getString("token");
            if (token == null || token.isEmpty()) {
                logger.warn("FCM token is null or empty for user: {}", userUid);
                return;
            }

            // Build notification
            String title = "📊 Mise à jour de votre signalement";
            String body = String.format("Statut changé : %s → %s", oldStatus, newStatus);
            
            Map<String, String> data = new HashMap<>();
            data.put("signalementId", String.valueOf(signalementId));
            data.put("oldStatus", oldStatus);
            data.put("newStatus", newStatus);
            data.put("type", "status_change");

            Message message = Message.builder()
                    .setToken(token)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .putAllData(data)
                    .build();

            // Send notification
            String response = firebaseMessaging.send(message);
            logger.info("Successfully sent notification to user {}: {}", userUid, response);

        } catch (Exception e) {
            logger.error("Failed to send notification to user {}: {}", userUid, e.getMessage());
        }
    }

    /**
     * Send notification to a user about validation status change
     */
    public void sendValidationStatusChangeNotification(String userUid, Long signalementId, String validationStatus, String note) {
        if (userUid == null || userUid.isEmpty()) {
            logger.warn("Cannot send notification: userUid is null or empty");
            return;
        }

        try {
            // Get user's FCM token from Firestore
            DocumentSnapshot tokenDoc = firestore.collection("user_tokens").document(userUid).get().get();
            
            if (!tokenDoc.exists()) {
                logger.info("No FCM token found for user: {}", userUid);
                return;
            }

            String token = tokenDoc.getString("token");
            if (token == null || token.isEmpty()) {
                logger.warn("FCM token is null or empty for user: {}", userUid);
                return;
            }

            // Build notification
            String title = "✅ Validation de votre signalement";
            String body = String.format("Statut de validation : %s", validationStatus);
            
            Map<String, String> data = new HashMap<>();
            data.put("signalementId", String.valueOf(signalementId));
            data.put("validationStatus", validationStatus);
            data.put("type", "validation_change");
            if (note != null && !note.isEmpty()) {
                data.put("note", note);
            }

            Message message = Message.builder()
                    .setToken(token)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .putAllData(data)
                    .build();

            // Send notification
            String response = firebaseMessaging.send(message);
            logger.info("Successfully sent validation notification to user {}: {}", userUid, response);

        } catch (Exception e) {
            logger.error("Failed to send validation notification to user {}: {}", userUid, e.getMessage());
        }
    }
}
