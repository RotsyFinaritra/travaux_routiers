package com.example.travauxroutiers.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.travauxroutiers.model.Signalement;
import com.example.travauxroutiers.model.SignalementStatus;

public interface SignalementStatusRepository extends JpaRepository<SignalementStatus, Long> {
    
    @Query("SELECT ss FROM SignalementStatus ss WHERE ss.signalement = :signalement ORDER BY ss.dateStatus ASC")
    List<SignalementStatus> findBySignalementOrderByDateStatusAsc(@Param("signalement") Signalement signalement);
    
    @Query("SELECT ss FROM SignalementStatus ss WHERE ss.signalement.id = :signalementId ORDER BY ss.dateStatus ASC")
    List<SignalementStatus> findBySignalementIdOrderByDateStatusAsc(@Param("signalementId") Long signalementId);
}
