package com.example.travauxroutiers.service;

import com.example.travauxroutiers.dto.AuthDtos;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthProvider authProvider;

    public AuthService(AuthProvider authProvider) {
        this.authProvider = authProvider;
    }

    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request) {
        return authProvider.login(request);
    }

    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest request) {
        return authProvider.register(request);
    }

    public AuthDtos.AuthResponse updateUser(Long userId, AuthDtos.UpdateUserRequest request) {
        return authProvider.updateUser(userId, request);
    }
}

