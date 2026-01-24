package com.example.travauxroutiers.service;

import com.example.travauxroutiers.dto.AuthDtos;

/**
 * Abstraction for authentication operations. The concrete implementation
 * depends on the active Spring profile ("cloud" for Firebase, "local" for Postgres).
 */
public interface AuthProvider {

    AuthDtos.AuthResponse login(AuthDtos.LoginRequest request);

    AuthDtos.AuthResponse register(AuthDtos.RegisterRequest request);

    AuthDtos.AuthResponse updateUser(Long userId, AuthDtos.UpdateUserRequest request);
}
