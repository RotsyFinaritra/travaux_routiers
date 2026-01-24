package com.example.travauxroutiers.repository;

import com.example.travauxroutiers.model.Status;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StatusRepository extends JpaRepository<Status, Long> {
}
