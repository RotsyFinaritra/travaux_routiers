package com.example.travauxroutiers.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.example.travauxroutiers.model.PrixM2;
import com.example.travauxroutiers.repository.PrixM2Repository;

@Service
public class PrixM2Service implements GenericService<PrixM2, Long> {
    private static final Logger logger = LoggerFactory.getLogger(PrixM2Service.class);

    private final PrixM2Repository repo;

    public PrixM2Service(PrixM2Repository repo) {
        this.repo = repo;
    }

    @Override
    public List<PrixM2> listAll() {
        return repo.findAll();
    }

    @Override
    public Optional<PrixM2> get(Long id) {
        return repo.findById(id);
    }

    /**
     * Retourne le prix/m² actuellement en vigueur (le plus récent).
     */
    public Optional<PrixM2> getCurrent() {
        return repo.findTopByOrderByDateDesc();
    }

    /**
     * Retourne le montant du prix/m² en vigueur, ou BigDecimal.ZERO par défaut.
     */
    public BigDecimal getCurrentMontant() {
        return getCurrent().map(PrixM2::getMontant).orElse(BigDecimal.ZERO);
    }

    @Override
    public PrixM2 create(PrixM2 prixM2) {
        if (prixM2.getDate() == null) {
            prixM2.setDate(LocalDateTime.now());
        }
        logger.info("Nouveau prix/m² créé: {} Ar", prixM2.getMontant());
        return repo.save(prixM2);
    }

    @Override
    public PrixM2 update(Long id, PrixM2 prixM2) {
        return repo.findById(id).map(existing -> {
            if (prixM2.getMontant() != null) {
                existing.setMontant(prixM2.getMontant());
            }
            if (prixM2.getDate() != null) {
                existing.setDate(prixM2.getDate());
            }
            logger.info("Prix/m² id={} mis à jour: {} Ar", id, existing.getMontant());
            return repo.save(existing);
        }).orElseGet(() -> {
            prixM2.setId(id);
            return repo.save(prixM2);
        });
    }

    @Override
    public void delete(Long id) {
        repo.deleteById(id);
        logger.info("Prix/m² id={} supprimé", id);
    }

    /**
     * Calcule le budget: prix_par_m2 * niveau * surface_m2 
     */
    public BigDecimal calculerBudget(BigDecimal surfaceArea, Integer niveau) {
        BigDecimal prixM2 = getCurrentMontant();
        if (surfaceArea == null || niveau == null || prixM2.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return prixM2
                .multiply(BigDecimal.valueOf(niveau))
                .multiply(surfaceArea);
    }
}
