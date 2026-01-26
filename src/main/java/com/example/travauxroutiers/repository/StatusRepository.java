package com.example.travauxroutiers.repository;

import com.example.travauxroutiers.model.Status;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StatusRepository extends JpaRepository<Status, Long> {
	Optional<Status> findByName(String name);
}
