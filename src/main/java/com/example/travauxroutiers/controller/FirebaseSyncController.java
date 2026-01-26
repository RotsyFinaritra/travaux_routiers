package com.example.travauxroutiers.controller;

import com.example.travauxroutiers.service.FirebaseSignalementSyncService;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@Profile("cloud")
@RequestMapping("/api/admin/firebase")
public class FirebaseSyncController {

    private final FirebaseSignalementSyncService syncService;

    public FirebaseSyncController(FirebaseSignalementSyncService syncService) {
        this.syncService = syncService;
    }

    @PostMapping("/sync/signalements")
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
}
