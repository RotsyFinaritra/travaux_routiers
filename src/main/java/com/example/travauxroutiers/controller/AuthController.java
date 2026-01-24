package com.example.travauxroutiers.controller;

import com.example.travauxroutiers.dto.AuthDtos;
import com.example.travauxroutiers.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Login endpoint. Behaviour depends on active profile:
     * - cloud: expects idToken (Firebase).
     * - local: expects usernameOrEmail + password.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthDtos.AuthResponse> login(@RequestBody AuthDtos.LoginRequest request) {
        AuthDtos.AuthResponse resp = authService.login(request);
        return ResponseEntity.status(resp.isSuccess() ? 200 : 401).body(resp);
    }

    /** Registration endpoint (mainly for local profile). */
    @PostMapping("/register")
    public ResponseEntity<AuthDtos.AuthResponse> register(@RequestBody AuthDtos.RegisterRequest request) {
        AuthDtos.AuthResponse resp = authService.register(request);
        return ResponseEntity.status(resp.isSuccess() ? 201 : 400).body(resp);
    }

    /** Update basic user info (username/email). */
    @PutMapping("/users/{id}")
    public ResponseEntity<AuthDtos.AuthResponse> updateUser(@PathVariable("id") Long userId,
                                                            @RequestBody AuthDtos.UpdateUserRequest request) {
        AuthDtos.AuthResponse resp = authService.updateUser(userId, request);
        return ResponseEntity.status(resp.isSuccess() ? 200 : 404).body(resp);
    }
}

