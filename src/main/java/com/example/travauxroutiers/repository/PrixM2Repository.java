package com.example.travauxroutiers.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.travauxroutiers.model.PrixM2;

public interface PrixM2Repository extends JpaRepository<PrixM2, Long> {
    /**
     * Retourne le prix/m² le plus récent (celui en vigueur).
     */
    Optional<PrixM2> findTopByOrderByDateDesc();
}
