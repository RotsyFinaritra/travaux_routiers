package com.example.travauxroutiers.controller;

import com.example.travauxroutiers.model.TypeUser;
import com.example.travauxroutiers.service.TypeUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/type-users")
public class TypeUserController {
    private final TypeUserService service;

    public TypeUserController(TypeUserService service) { this.service = service; }

    @GetMapping
    public List<TypeUser> list() { return service.listAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<TypeUser> get(@PathVariable Long id) { return service.get(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build()); }

    @PostMapping
    public ResponseEntity<TypeUser> create(@RequestBody TypeUser t) { TypeUser c = service.create(t); return ResponseEntity.created(URI.create("/api/type-users/"+c.getId())).body(c); }

    @PutMapping("/{id}")
    public ResponseEntity<TypeUser> update(@PathVariable Long id, @RequestBody TypeUser t) { return ResponseEntity.ok(service.update(id, t)); }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) { service.delete(id); return ResponseEntity.noContent().build(); }
}
