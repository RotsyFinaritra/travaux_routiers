package com.example.travauxroutiers.controller;

import com.example.travauxroutiers.model.ValidationStatus;
import com.example.travauxroutiers.service.ValidationStatusService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/validation-statuses")
public class ValidationStatusController {
    private final ValidationStatusService service;

    public ValidationStatusController(ValidationStatusService service) { this.service = service; }

    @GetMapping
    public List<ValidationStatus> list() { return service.listAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<ValidationStatus> get(@PathVariable Long id) { return service.get(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build()); }

    @PostMapping
    public ResponseEntity<ValidationStatus> create(@RequestBody ValidationStatus t) { ValidationStatus c = service.create(t); return ResponseEntity.created(URI.create("/api/validation-statuses/"+c.getId())).body(c); }

    @PutMapping("/{id}")
    public ResponseEntity<ValidationStatus> update(@PathVariable Long id, @RequestBody ValidationStatus t) { return ResponseEntity.ok(service.update(id, t)); }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) { service.delete(id); return ResponseEntity.noContent().build(); }
}
