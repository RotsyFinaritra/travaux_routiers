package com.example.travauxroutiers.controller;

import com.example.travauxroutiers.service.FirebaseSignalementSyncService;
import com.example.travauxroutiers.service.FirebaseUserSyncService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@Profile("cloud")
@RequestMapping("/api/admin/firebase")
@Tag(name = "Synchronisation", description = "Synchronisation entre Firebase et la base locale")
public class FirebaseSyncController {

    private final FirebaseSignalementSyncService syncService;
    private final FirebaseUserSyncService userSyncService;

    public FirebaseSyncController(FirebaseSignalementSyncService syncService, FirebaseUserSyncService userSyncService) {
        this.syncService = syncService;
        this.userSyncService = userSyncService;
    }

    @PostMapping("/sync/signalements")
    @Operation(summary = "Synchroniser Firebase → Local (signalements)")
    public ResponseEntity<?> syncSignalements(@RequestHeader(value = "X-ADMIN-KEY", required = false) String adminKey) {
        String expected = System.getenv("ADMIN_API_KEY");
        if (expected == null || expected.isEmpty() || adminKey == null || !adminKey.equals(expected)) {
            return ResponseEntity.status(403).body(Map.of("message", "forbidden"));
        }

        try {
            return ResponseEntity.ok(syncService.syncSignalements());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/sync/signalements/reverse")
    @Operation(summary = "Synchroniser Local → Firebase (signalements)")
    public ResponseEntity<?> syncLocalToFirebase(@RequestHeader(value = "X-ADMIN-KEY", required = false) String adminKey) {
        String expected = System.getenv("ADMIN_API_KEY");
        if (expected == null || expected.isEmpty() || adminKey == null || !adminKey.equals(expected)) {
            return ResponseEntity.status(403).body(Map.of("message", "forbidden"));
        }

        try {
            return ResponseEntity.ok(syncService.syncLocalToFirebase());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/sync/users")
    @Operation(summary = "Synchroniser Local → Firebase (utilisateurs)")
    public ResponseEntity<?> syncUsersToFirebase(@RequestHeader(value = "X-ADMIN-KEY", required = false) String adminKey) {
        String expected = System.getenv("ADMIN_API_KEY");
        if (expected == null || expected.isEmpty() || adminKey == null || !adminKey.equals(expected)) {
            return ResponseEntity.status(403).body(Map.of("message", "forbidden"));
        }

        try {
            return ResponseEntity.ok(userSyncService.syncUsersToFirebase());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
