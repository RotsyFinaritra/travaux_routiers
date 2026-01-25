package com.example.travauxroutiers.controller;

import com.example.travauxroutiers.model.Validation;
import com.example.travauxroutiers.model.ValidationHistory;
import com.example.travauxroutiers.service.ValidationService;
import com.example.travauxroutiers.repository.ValidationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/signalements")
public class ValidationController {
    private final ValidationService service;
    private final ValidationRepository validationRepository;

    public ValidationController(ValidationService service, ValidationRepository validationRepository) {
        this.service = service;
        this.validationRepository = validationRepository;
    }

    @PostMapping("/{id}/validate")
    public ResponseEntity<?> validate(@RequestHeader(value = "X-ADMIN-KEY", required = false) String adminKey,
                                      @PathVariable("id") Long signalementId,
                                      @RequestBody Map<String, Object> body) {
        String expected = System.getenv("ADMIN_API_KEY");
        if (expected == null || expected.isEmpty() || adminKey == null || !adminKey.equals(expected)) {
            return ResponseEntity.status(403).body(Map.of("message", "forbidden"));
        }

        Number statusIdNum = (Number) body.get("statusId");
        String note = body.getOrDefault("note", "") instanceof String ? (String) body.get("note") : null;
        Number byUser = (Number) body.get("userId");
        if (statusIdNum == null || byUser == null) return ResponseEntity.badRequest().body(Map.of("message", "missing-fields"));

        try {
            Validation v = service.changeStatus(signalementId, statusIdNum.longValue(), byUser.longValue(), note);
            return ResponseEntity.ok(v);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}/validation/history")
    public ResponseEntity<List<ValidationHistory>> history(@PathVariable("id") Long signalementId) {
        return validationRepository.findBySignalementId(signalementId)
                .map(v -> ResponseEntity.ok(service.historyForValidation(v.getId())))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
