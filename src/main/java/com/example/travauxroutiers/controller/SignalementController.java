package com.example.travauxroutiers.controller;

import java.net.URI;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.travauxroutiers.model.Signalement;
import com.example.travauxroutiers.service.SignalementService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/signalements")
@Tag(name = "Signalements", description = "Gestion des signalements")
public class SignalementController {
    private static final Logger logger = LoggerFactory.getLogger(SignalementController.class);

    private final SignalementService service;

    public SignalementController(SignalementService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Lister les signalements")
    public List<Signalement> list(@RequestParam(value = "validationStatus", required = false) String validationStatus) {
        if (validationStatus != null && !validationStatus.trim().isEmpty()) {
            return service.listByValidationStatusName(validationStatus);
        }
        return service.listAll();
    }

    @GetMapping("/pending-validation")
    @Operation(summary = "Lister les signalements en attente de validation")
    public List<Signalement> pendingValidation() {
        return service.listByValidationStatusName("PENDING");
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupérer un signalement par id")
    public ResponseEntity<Signalement> get(@PathVariable Long id) {
        try {
            return service.get(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception ex) {
            logger.error("[SignalementController] GET /api/signalements/{} failed", id, ex);
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping
    @Operation(summary = "Créer un signalement")
    public ResponseEntity<Signalement> create(@RequestBody Signalement t) {
        Signalement c = service.create(t);
        return ResponseEntity.created(URI.create("/api/signalements/" + c.getId())).body(c);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour un signalement")
    public ResponseEntity<Signalement> update(@PathVariable Long id, @RequestBody Signalement t) {
        try {
            logger.info("[SignalementController] Update request for id {} with payload: {}", id, t);
            Signalement updated = service.update(id, t);
            return ResponseEntity.ok(updated);
        } catch (Exception ex) {
            logger.error("[SignalementController] PUT /api/signalements/{} failed", id, ex);
            return ResponseEntity.status(500).build();
        }
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Changer le status d'un signalement")
    public ResponseEntity<Signalement> updateStatus(@PathVariable Long id,
            @RequestBody Map<String, Object> statusData) {
        try {
            logger.info("[SignalementController] Update status request for id {} with payload: {}", id, statusData);
            Object statusObj = statusData.get("status");
            if (statusObj instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> statusMap = (Map<String, Object>) statusObj;
                Object idObj = statusMap.get("id");
                if (idObj instanceof Number) {
                    Long statusId = ((Number) idObj).longValue();
                    Signalement updated = service.updateStatus(id, statusId);
                    return ResponseEntity.ok(updated);
                }
            }
            return ResponseEntity.badRequest().build();
        } catch (Exception ex) {
            logger.error("[SignalementController] PATCH /api/signalements/{}/status failed", id, ex);
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un signalement")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
