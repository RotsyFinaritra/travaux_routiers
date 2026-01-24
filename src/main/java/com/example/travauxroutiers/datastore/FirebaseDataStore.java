package com.example.travauxroutiers.datastore;

import com.google.firebase.FirebaseApp;
import com.google.firebase.cloud.FirestoreClient;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import com.google.cloud.firestore.Firestore;

/**
 * Minimal Firebase-backed DataStore stub.
 * Marked for profile 'cloud' (configured in FirebaseConfig).
 */
@Service
@Profile("cloud")
public class FirebaseDataStore implements DataStore {
    private final FirebaseApp app;
    private final Firestore firestore;

    public FirebaseDataStore(FirebaseApp app) {
        this.app = app;
        this.firestore = FirestoreClient.getFirestore(app);
    }

    @Override
    public void ping() {
        org.slf4j.LoggerFactory.getLogger(FirebaseDataStore.class)
                .info("FirebaseDataStore initialized (app: {})", app.getName());
    }

    @Override
    public <T> java.util.Optional<T> findById(Class<T> type, String id) {
        // stub: real implementation should use Firestore API
        return java.util.Optional.empty();
    }

    @Override
    public <T> T save(String collection, T entity) {
        // stub: real implementation should write to Firestore
        return entity;
    }
}
