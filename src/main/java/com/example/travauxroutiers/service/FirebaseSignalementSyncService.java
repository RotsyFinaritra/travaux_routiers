package com.example.travauxroutiers.service;

import com.example.travauxroutiers.model.Signalement;
import com.example.travauxroutiers.model.Status;
import com.example.travauxroutiers.model.TypeUser;
import com.example.travauxroutiers.model.User;
import com.example.travauxroutiers.repository.SignalementRepository;
import com.example.travauxroutiers.repository.StatusRepository;
import com.example.travauxroutiers.repository.TypeUserRepository;
import com.example.travauxroutiers.repository.UserRepository;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.firebase.FirebaseApp;
import com.google.firebase.cloud.FirestoreClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@Profile("cloud")
public class FirebaseSignalementSyncService {
    private static final Logger logger = LoggerFactory.getLogger(FirebaseSignalementSyncService.class);

    private final Firestore firestore;
    private final SignalementRepository signalementRepository;
    private final StatusRepository statusRepository;
    private final UserRepository userRepository;
    private final TypeUserRepository typeUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final ValidationService validationService;

    public FirebaseSignalementSyncService(
            FirebaseApp firebaseApp,
            SignalementRepository signalementRepository,
            StatusRepository statusRepository,
            UserRepository userRepository,
            TypeUserRepository typeUserRepository,
            PasswordEncoder passwordEncoder,
            ValidationService validationService
    ) {
        this.firestore = FirestoreClient.getFirestore(firebaseApp);
        this.signalementRepository = signalementRepository;
        this.statusRepository = statusRepository;
        this.userRepository = userRepository;
        this.typeUserRepository = typeUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.validationService = validationService;
    }

    public Map<String, Object> syncSignalements() {
        int created = 0;
        int updated = 0;
        int skipped = 0;
        int errors = 0;

        try {
            QuerySnapshot snap = firestore.collection("signalements").get().get();
            for (DocumentSnapshot doc : snap.getDocuments()) {
                try {
                    SyncDecision decision = upsertSignalementFromDoc(doc);
                    switch (decision) {
                        case CREATED -> created++;
                        case UPDATED -> updated++;
                        case SKIPPED -> skipped++;
                    }
                } catch (Exception e) {
                    errors++;
                    logger.warn("Sync signalement doc {} failed: {}", doc.getId(), e.getMessage());
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("firestore-sync-failed: " + e.getMessage(), e);
        }

        return Map.of(
                "success", true,
                "created", created,
                "updated", updated,
                "skipped", skipped,
                "errors", errors
        );
    }

    public Map<String, Object> syncLocalToFirebase() {
        int created = 0;
        int updated = 0;
        int skipped = 0;
        int errors = 0;

        try {
            for (Signalement sig : signalementRepository.findAll()) {
                try {
                    // Skip if already synced to Firebase
                    if (sig.getFirebaseDocId() != null && !sig.getFirebaseDocId().isEmpty()) {
                        // Check if doc exists in Firebase, update if needed
                        DocumentReference docRef = firestore.collection("signalements").document(sig.getFirebaseDocId());
                        DocumentSnapshot doc = docRef.get().get();
                        
                        if (doc.exists()) {
                            // Update existing doc
                            docRef.update(buildFirebaseData(sig)).get();
                            updated++;
                        } else {
                            // Doc was deleted in Firebase, recreate
                            docRef.set(buildFirebaseData(sig)).get();
                            created++;
                        }
                    } else {
                        // Create new Firebase document
                        DocumentReference docRef = firestore.collection("signalements").document();
                        docRef.set(buildFirebaseData(sig)).get();
                        
                        // Save Firebase doc ID back to local DB
                        sig.setFirebaseDocId(docRef.getId());
                        signalementRepository.save(sig);
                        created++;
                    }
                } catch (Exception e) {
                    errors++;
                    logger.warn("Sync local signalement {} to Firebase failed: {}", sig.getId(), e.getMessage());
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("local-to-firebase-sync-failed: " + e.getMessage(), e);
        }

        return Map.of(
                "success", true,
                "created", created,
                "updated", updated,
                "skipped", skipped,
                "errors", errors
        );
    }

    private Map<String, Object> buildFirebaseData(Signalement sig) {
        Map<String, Object> data = new HashMap<>();
        data.put("source", "web-manager");
        data.put("latitude", sig.getLatitude().doubleValue());
        data.put("longitude", sig.getLongitude().doubleValue());
        data.put("description", sig.getDescription());
        data.put("statusName", sig.getStatus().getName());
        
        if (sig.getValidation() != null) {
            data.put("validationStatusName", sig.getValidation().getStatus().getName());
        } else {
            data.put("validationStatusName", "PENDING");
        }
        
        if (sig.getSurfaceArea() != null) {
            data.put("surfaceArea", sig.getSurfaceArea().doubleValue());
        }
        if (sig.getBudget() != null) {
            data.put("budget", sig.getBudget().doubleValue());
        }
        if (sig.getPhotoUrl() != null) {
            data.put("photoUrl", sig.getPhotoUrl());
        }
        
        if (sig.getUser() != null) {
            data.put("userEmail", sig.getUser().getEmail());
            data.put("userDisplayName", sig.getUser().getUsername());
        }
        
        data.put("syncedToLocalAt", Timestamp.now());
        data.put("localId", sig.getId());
        
        return data;
    }

    private enum SyncDecision { CREATED, UPDATED, SKIPPED }

    private SyncDecision upsertSignalementFromDoc(DocumentSnapshot doc) throws Exception {
        // Minimal required fields
        Double lat = doc.getDouble("latitude");
        Double lng = doc.getDouble("longitude");
        String description = doc.getString("description");
        String statusName = Optional.ofNullable(doc.getString("statusName")).orElse("NOUVEAU").toUpperCase();

        if (lat == null || lng == null || description == null || description.isBlank()) {
            return SyncDecision.SKIPPED;
        }

        String userEmail = doc.getString("userEmail");
        String userDisplayName = doc.getString("userDisplayName");
        String userUid = doc.getString("userUid");
        User localUser = ensureLocalUser(userEmail, userDisplayName, userUid);

        Status status = statusRepository.findByName(statusName)
                .orElseGet(() -> {
                    Status s = new Status();
                    s.setName(statusName);
                    s.setDescription(null);
                    return statusRepository.save(s);
                });

        LocalDateTime date = LocalDateTime.now();
        com.google.cloud.Timestamp createdAt = doc.getTimestamp("createdAt");
        if (createdAt != null) {
            Instant inst = Instant.ofEpochSecond(createdAt.getSeconds(), createdAt.getNanos());
            date = LocalDateTime.ofInstant(inst, ZoneId.systemDefault());
        }

        Optional<Signalement> existingOpt = signalementRepository.findByFirebaseDocId(doc.getId());
        if (existingOpt.isPresent()) {
            Signalement existing = existingOpt.get();
            boolean changed = false;

            BigDecimal newLat = BigDecimal.valueOf(lat);
            BigDecimal newLng = BigDecimal.valueOf(lng);
            if (existing.getLatitude() == null || existing.getLatitude().compareTo(newLat) != 0) {
                existing.setLatitude(newLat);
                changed = true;
            }
            if (existing.getLongitude() == null || existing.getLongitude().compareTo(newLng) != 0) {
                existing.setLongitude(newLng);
                changed = true;
            }
            if (existing.getDescription() == null || !existing.getDescription().equals(description)) {
                existing.setDescription(description);
                changed = true;
            }
            if (existing.getStatus() == null || existing.getStatus().getId() == null || !existing.getStatus().getId().equals(status.getId())) {
                existing.setStatus(status);
                changed = true;
            }
            if (existing.getUser() == null || existing.getUser().getId() == null || !existing.getUser().getId().equals(localUser.getId())) {
                existing.setUser(localUser);
                changed = true;
            }
            
            // Update userUid field
            if (!java.util.Objects.equals(existing.getUserUid(), userUid)) {
                existing.setUserUid(userUid);
                changed = true;
            }

            // Optional fields: surfaceArea, budget, photoUrl
            Double surfaceArea = doc.getDouble("surfaceArea");
            BigDecimal newSurfaceArea = surfaceArea != null ? BigDecimal.valueOf(surfaceArea) : null;
            if (!java.util.Objects.equals(existing.getSurfaceArea(), newSurfaceArea)) {
                existing.setSurfaceArea(newSurfaceArea);
                changed = true;
            }

            Double budget = doc.getDouble("budget");
            BigDecimal newBudget = budget != null ? BigDecimal.valueOf(budget) : null;
            if (!java.util.Objects.equals(existing.getBudget(), newBudget)) {
                existing.setBudget(newBudget);
                changed = true;
            }

            String photoUrl = doc.getString("photoUrl");
            String newPhotoUrl = (photoUrl != null && !photoUrl.isBlank()) ? photoUrl : null;
            if (!java.util.Objects.equals(existing.getPhotoUrl(), newPhotoUrl)) {
                existing.setPhotoUrl(newPhotoUrl);
                changed = true;
            }

            if (!changed) {
                markDocSynced(doc.getReference(), existing.getId());
                return SyncDecision.SKIPPED;
            }

            signalementRepository.save(existing);
            validationService.ensureForSignalement(existing);
            markDocSynced(doc.getReference(), existing.getId());
            return SyncDecision.UPDATED;
        }

        Signalement s = new Signalement();
        s.setFirebaseDocId(doc.getId());
        s.setUser(localUser);
        s.setUserUid(userUid);
        s.setStatus(status);
        s.setLatitude(BigDecimal.valueOf(lat));
        s.setLongitude(BigDecimal.valueOf(lng));
        s.setDescription(description);
        s.setDateSignalement(date);

        // Optional numeric fields (may be stored as number)
        Double surfaceArea = doc.getDouble("surfaceArea");
        if (surfaceArea != null) s.setSurfaceArea(BigDecimal.valueOf(surfaceArea));
        Double budget = doc.getDouble("budget");
        if (budget != null) s.setBudget(BigDecimal.valueOf(budget));
        String photoUrl = doc.getString("photoUrl");
        if (photoUrl != null && !photoUrl.isBlank()) s.setPhotoUrl(photoUrl);

        Signalement saved = signalementRepository.save(s);
        validationService.ensureForSignalement(saved);

        markDocSynced(doc.getReference(), saved.getId());
        return SyncDecision.CREATED;
    }

    private User ensureLocalUser(String email, String displayName, String uid) {
        // If we have no email, synthesize one from uid (still unique / required by DB)
        String safeEmail = (email != null && !email.isBlank()) ? email : (uid != null && !uid.isBlank() ? (uid + "@firebase.local") : null);
        if (safeEmail == null) {
            throw new IllegalArgumentException("missing-user-email-and-uid");
        }

        return userRepository.findByEmail(safeEmail).orElseGet(() -> {
            TypeUser type = typeUserRepository.findByName("USER").orElseGet(() -> {
                TypeUser t = new TypeUser();
                t.setName("USER");
                return typeUserRepository.save(t);
            });

            User u = new User();
            u.setEmail(safeEmail);
            u.setTypeUser(type);

            String baseUsername = (displayName != null && !displayName.isBlank())
                    ? displayName
                    : safeEmail.split("@", 2)[0];
            baseUsername = baseUsername.replaceAll("[^a-zA-Z0-9._-]", "_");
            if (baseUsername.length() > 50) baseUsername = baseUsername.substring(0, 50);
            if (baseUsername.isBlank()) baseUsername = "user";

            String username = baseUsername;
            if (userRepository.findByUsername(username).isPresent()) {
                String suffix = (uid != null && uid.length() >= 6) ? uid.substring(0, 6) : String.valueOf(System.currentTimeMillis() % 100000);
                username = (baseUsername + "_" + suffix);
                if (username.length() > 50) username = username.substring(0, 50);
            }
            u.setUsername(username);

            // local password is required by schema, but not used for Firebase users
            u.setPasswordHash(passwordEncoder.encode("firebase"));

            return userRepository.save(u);
        });
    }

    private void markDocSynced(DocumentReference ref, Long localId) {
        try {
            Map<String, Object> patch = new HashMap<>();
            patch.put("syncedToLocalAt", Timestamp.now());
            patch.put("localId", localId);
            ref.update(patch);
        } catch (Exception e) {
            logger.debug("Could not mark Firestore doc synced: {}", e.getMessage());
        }
    }
}
