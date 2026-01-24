package com.example.travauxroutiers.controller;

import com.example.travauxroutiers.model.Status;
import com.example.travauxroutiers.service.StatusService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/statuses")
public class StatusController {
    private final StatusService service;

    public StatusController(StatusService service) { this.service = service; }

    @GetMapping
    public List<Status> list() { return service.listAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Status> get(@PathVariable Long id) { return service.get(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build()); }

    @PostMapping
    public ResponseEntity<Status> create(@RequestBody Status t) { Status c = service.create(t); return ResponseEntity.created(URI.create("/api/statuses/"+c.getId())).body(c); }

    @PutMapping("/{id}")
    public ResponseEntity<Status> update(@PathVariable Long id, @RequestBody Status t) { return ResponseEntity.ok(service.update(id, t)); }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) { service.delete(id); return ResponseEntity.noContent().build(); }
}
