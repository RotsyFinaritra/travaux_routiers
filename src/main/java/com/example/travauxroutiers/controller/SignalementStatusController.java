package com.example.travauxroutiers.controller;

import com.example.travauxroutiers.model.SignalementStatus;
import com.example.travauxroutiers.service.SignalementStatusService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/signalement-statuses")
public class SignalementStatusController {
    private final SignalementStatusService service;

    public SignalementStatusController(SignalementStatusService service) { this.service = service; }

    @GetMapping
    public List<SignalementStatus> list() { return service.listAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<SignalementStatus> get(@PathVariable Long id) { return service.get(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build()); }

    @PostMapping
    public ResponseEntity<SignalementStatus> create(@RequestBody SignalementStatus t) { SignalementStatus c = service.create(t); return ResponseEntity.created(URI.create("/api/signalement-statuses/"+c.getId())).body(c); }

    @PutMapping("/{id}")
    public ResponseEntity<SignalementStatus> update(@PathVariable Long id, @RequestBody SignalementStatus t) { return ResponseEntity.ok(service.update(id, t)); }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) { service.delete(id); return ResponseEntity.noContent().build(); }
}
