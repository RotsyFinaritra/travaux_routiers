package com.example.travauxroutiers.repository;

import com.example.travauxroutiers.model.SignalementStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SignalementStatusRepository extends JpaRepository<SignalementStatus, Long> {
}
