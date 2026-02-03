package com.example.travauxroutiers.service;

import com.example.travauxroutiers.model.User;
import com.example.travauxroutiers.repository.UserRepository;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.cloud.FirestoreClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@Profile("cloud")
public class FirebaseUserSyncService {
    private static final Logger logger = LoggerFactory.getLogger(FirebaseUserSyncService.class);

    private final Firestore firestore;
    private final UserRepository userRepository;

    public FirebaseUserSyncService(FirebaseApp firebaseApp, UserRepository userRepository) {
        this.firestore = FirestoreClient.getFirestore(firebaseApp);
        this.userRepository = userRepository;
    }

    public Map<String, Object> syncUsersToFirebase() {
        int created = 0;
        int updated = 0;
        int errors = 0;

        try {
            for (User user : userRepository.findAll()) {
                try {
                    String docId = user.getEmail().replaceAll("[^a-zA-Z0-9._-]", "_");
                    DocumentReference docRef = firestore.collection("users").document(docId);
                    
                    Map<String, Object> data = buildFirebaseUserData(user);
                    
                    // Check if document exists
                    if (docRef.get().get().exists()) {
                        // Update existing document
                        docRef.update(data).get();
                        updated++;
                    } else {
                        // Create new document
                        docRef.set(data).get();
                        created++;
                    }
                } catch (Exception e) {
                    errors++;
                    logger.warn("Sync user {} to Firebase failed: {}", user.getId(), e.getMessage());
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("users-to-firebase-sync-failed: " + e.getMessage(), e);
        }

        return Map.of(
                "success", true,
                "created", created,
                "updated", updated,
                "errors", errors
        );
    }

    private Map<String, Object> buildFirebaseUserData(User user) {
        Map<String, Object> data = new HashMap<>();
        data.put("email", user.getEmail());
        data.put("username", user.getUsername());
        data.put("blocked", user.getIsBlocked() != null ? user.getIsBlocked() : false);
        
        if (user.getTypeUser() != null) {
            data.put("role", user.getTypeUser().getName());
        } else {
            data.put("role", "USER");
        }
        
        data.put("syncedAt", Timestamp.now());
        data.put("localId", user.getId());
        
        return data;
    }
}
