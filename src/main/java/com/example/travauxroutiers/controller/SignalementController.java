package com.example.travauxroutiers.controller;

import com.example.travauxroutiers.model.Signalement;
import com.example.travauxroutiers.service.SignalementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/signalements")
public class SignalementController {
    private final SignalementService service;

    public SignalementController(SignalementService service) { this.service = service; }

    @GetMapping
    public List<Signalement> list(@RequestParam(value = "validationStatus", required = false) String validationStatus) {
        if (validationStatus != null && !validationStatus.trim().isEmpty()) {
            return service.listByValidationStatusName(validationStatus);
        }
        return service.listAll();
    }

    @GetMapping("/pending-validation")
    public List<Signalement> pendingValidation() {
        return service.listByValidationStatusName("PENDING");
    }

    @GetMapping("/{id}")
    public ResponseEntity<Signalement> get(@PathVariable Long id) { return service.get(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build()); }

    @PostMapping
    public ResponseEntity<Signalement> create(@RequestBody Signalement t) { Signalement c = service.create(t); return ResponseEntity.created(URI.create("/api/signalements/"+c.getId())).body(c); }

    @PutMapping("/{id}")
    public ResponseEntity<Signalement> update(@PathVariable Long id, @RequestBody Signalement t) { return ResponseEntity.ok(service.update(id, t)); }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) { service.delete(id); return ResponseEntity.noContent().build(); }
}
