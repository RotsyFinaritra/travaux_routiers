package com.example.travauxroutiers.repository;

import com.example.travauxroutiers.model.SignalementStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

public interface SignalementStatusRepository extends JpaRepository<SignalementStatus, Long> {
    @Transactional
    void deleteBySignalementId(Long signalementId);
}
