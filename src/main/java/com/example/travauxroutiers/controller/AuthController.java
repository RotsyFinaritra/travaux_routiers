package com.example.travauxroutiers.controller;

import com.example.travauxroutiers.dto.AuthDtos;
import com.example.travauxroutiers.model.User;
import com.example.travauxroutiers.repository.UserRepository;
import com.example.travauxroutiers.repository.TypeUserRepository;
import com.example.travauxroutiers.service.AuthService;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;

import java.util.Optional;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final TypeUserRepository typeUserRepository;

    public AuthController(AuthService authService, UserRepository userRepository, TypeUserRepository typeUserRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.typeUserRepository = typeUserRepository;
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

    /**
     * Get current user info.
     * - If `Authorization: Bearer <idToken>` is provided, verifies Firebase token and returns the mapped local user.
     * - Otherwise accepts `X-USER-ID` header or `?userId=` query param to fetch the user by id (local mode).
     */
    @GetMapping("/me")
    public ResponseEntity<AuthDtos.AuthResponse> me(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestHeader(value = "X-USER-ID", required = false) String headerUserId,
            @RequestParam(value = "userId", required = false) Long queryUserId
    ) {
        AuthDtos.AuthResponse resp = new AuthDtos.AuthResponse();

        // Try Authorization Bearer token (Firebase)
        if (authorization != null && authorization.toLowerCase().startsWith("bearer ")) {
            String idToken = authorization.substring(7).trim();
            try {
                FirebaseToken decoded = FirebaseAuth.getInstance().verifyIdToken(idToken);
                String email = decoded.getEmail();
                String username = decoded.getUid();

                Optional<User> existing = (email != null)
                        ? userRepository.findByEmail(email)
                        : userRepository.findByUsername(username);

                if (existing.isEmpty()) {
                    resp.setSuccess(false);
                    resp.setMessage("user-not-found");
                    return ResponseEntity.status(404).body(resp);
                }

                User user = existing.get();
                resp.setSuccess(true);
                resp.setMessage("ok");
                resp.setUserId(user.getId());
                resp.setUsername(user.getUsername());
                resp.setEmail(user.getEmail());
                resp.setTypeName(user.getTypeUser() != null ? user.getTypeUser().getName() : "USER");
                return ResponseEntity.ok(resp);
            } catch (Exception e) {
                resp.setSuccess(false);
                resp.setMessage("invalid-token: " + e.getMessage());
                return ResponseEntity.status(401).body(resp);
            }
        }

        // Try X-USER-ID header or query param
        Long idToFind = null;
        if (queryUserId != null) idToFind = queryUserId;
        else if (headerUserId != null) {
            try {
                idToFind = Long.parseLong(headerUserId);
            } catch (NumberFormatException ignored) {}
        }

        if (idToFind != null) {
            Optional<User> opt = userRepository.findById(idToFind);
            if (opt.isEmpty()) {
                resp.setSuccess(false);
                resp.setMessage("user-not-found");
                return ResponseEntity.status(404).body(resp);
            }
            User user = opt.get();
            resp.setSuccess(true);
            resp.setMessage("ok");
            resp.setUserId(user.getId());
            resp.setUsername(user.getUsername());
            resp.setEmail(user.getEmail());
            resp.setTypeName(user.getTypeUser() != null ? user.getTypeUser().getName() : "USER");
            return ResponseEntity.ok(resp);
        }

        resp.setSuccess(false);
        resp.setMessage("unauthorized");
        return ResponseEntity.status(401).body(resp);
    }
}

