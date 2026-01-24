package com.example.travauxroutiers.repository;

import com.example.travauxroutiers.model.Entreprise;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EntrepriseRepository extends JpaRepository<Entreprise, Long> {
}
