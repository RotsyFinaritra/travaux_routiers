package com.example.travauxroutiers.repository;

import com.example.travauxroutiers.model.Validation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ValidationRepository extends JpaRepository<Validation, Long> {
    Optional<Validation> findBySignalementId(Long signalementId);
}
