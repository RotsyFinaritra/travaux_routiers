package com.example.travauxroutiers.repository;

import com.example.travauxroutiers.model.ValidationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ValidationStatusRepository extends JpaRepository<ValidationStatus, Long> {
    Optional<ValidationStatus> findByName(String name);
}
