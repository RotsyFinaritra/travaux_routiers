package com.example.travauxroutiers.controller;

import com.example.travauxroutiers.model.Entreprise;
import com.example.travauxroutiers.service.EntrepriseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/entreprises")
public class EntrepriseController {
    private final EntrepriseService service;

    public EntrepriseController(EntrepriseService service) { this.service = service; }

    @GetMapping
    public List<Entreprise> list() { return service.listAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Entreprise> get(@PathVariable Long id) { return service.get(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build()); }

    @PostMapping
    public ResponseEntity<Entreprise> create(@RequestBody Entreprise t) { Entreprise c = service.create(t); return ResponseEntity.created(URI.create("/api/entreprises/"+c.getId())).body(c); }

    @PutMapping("/{id}")
    public ResponseEntity<Entreprise> update(@PathVariable Long id, @RequestBody Entreprise t) { return ResponseEntity.ok(service.update(id, t)); }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) { service.delete(id); return ResponseEntity.noContent().build(); }
}
