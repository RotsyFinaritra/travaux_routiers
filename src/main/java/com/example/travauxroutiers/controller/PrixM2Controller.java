package com.example.travauxroutiers.controller;

import java.math.BigDecimal;
import java.net.URI;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.travauxroutiers.model.PrixM2;
import com.example.travauxroutiers.service.PrixM2Service;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/prix-m2")
@Tag(name = "Prix M2", description = "Configuration du prix forfaitaire par m²")
public class PrixM2Controller {

    private final PrixM2Service service;

    public PrixM2Controller(PrixM2Service service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Lister tous les historiques de prix/m²")
    public List<PrixM2> list() {
        return service.listAll();
    }

    @GetMapping("/current")
    @Operation(summary = "Récupérer le prix/m² en vigueur (le plus récent)")
    public ResponseEntity<PrixM2> getCurrent() {
        return service.getCurrent()
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupérer un prix/m² par id")
    public ResponseEntity<PrixM2> get(@PathVariable Long id) {
        return service.get(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Définir un nouveau prix/m² (devient le prix en vigueur)")
    public ResponseEntity<PrixM2> create(@RequestBody PrixM2 prixM2) {
        PrixM2 created = service.create(prixM2);
        return ResponseEntity.created(URI.create("/api/prix-m2/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier un prix/m²")
    public ResponseEntity<PrixM2> update(@PathVariable Long id, @RequestBody PrixM2 prixM2) {
        return ResponseEntity.ok(service.update(id, prixM2));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un prix/m²")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/calculer-budget")
    @Operation(summary = "Calculer le budget estimé: prix_m2 * niveau * surface")
    public ResponseEntity<Map<String, Object>> calculerBudget(@RequestBody Map<String, Object> params) {
        BigDecimal surface = params.get("surfaceArea") != null
                ? new BigDecimal(params.get("surfaceArea").toString())
                : null;
        Integer niveau = params.get("niveau") != null
                ? Integer.valueOf(params.get("niveau").toString())
                : null;

        BigDecimal budget = service.calculerBudget(surface, niveau);
        BigDecimal prixM2 = service.getCurrentMontant();

        return ResponseEntity.ok(Map.of(
                "budget", budget,
                "prixM2", prixM2,
                "niveau", niveau != null ? niveau : 0,
                "surfaceArea", surface != null ? surface : BigDecimal.ZERO));
    }
}
