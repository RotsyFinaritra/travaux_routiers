package com.example.travauxroutiers.repository;

import com.example.travauxroutiers.model.Signalement;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SignalementRepository extends JpaRepository<Signalement, Long> {
}
