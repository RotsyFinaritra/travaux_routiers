package com.example.travauxroutiers.repository;

import com.example.travauxroutiers.model.ValidationHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ValidationHistoryRepository extends JpaRepository<ValidationHistory, Long> {
    List<ValidationHistory> findByValidationIdOrderByChangedAtDesc(Long validationId);
    
    @Transactional
    void deleteByValidationId(Long validationId);
}
