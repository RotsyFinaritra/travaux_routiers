package com.example.travauxroutiers.repository;

import com.example.travauxroutiers.model.TypeUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TypeUserRepository extends JpaRepository<TypeUser, Long> {
	Optional<TypeUser> findByName(String name);
}
