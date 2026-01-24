package com.example.travauxroutiers.repository;

import com.example.travauxroutiers.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
