package com.example.travauxroutiers.service;

import com.example.travauxroutiers.dto.AuthDtos;
import com.example.travauxroutiers.model.User;
import com.example.travauxroutiers.repository.UserRepository;
import com.example.travauxroutiers.repository.TypeUserRepository;
import com.example.travauxroutiers.model.TypeUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Profile("local")
public class LocalAuthProvider implements AuthProvider {

    private static final Logger logger = LoggerFactory.getLogger(LocalAuthProvider.class);

    private final UserRepository userRepository;
    private final TypeUserRepository typeUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Value("${app.security.max-login-attempts:3}")
    private int maxLoginAttempts;

    public LocalAuthProvider(UserRepository userRepository, TypeUserRepository typeUserRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.typeUserRepository = typeUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Override
    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request) {
        AuthDtos.AuthResponse resp = new AuthDtos.AuthResponse();

        String identifier = request.getUsernameOrEmail();
        String password = request.getPassword();

        if (identifier == null || identifier.isBlank() || password == null) {
            resp.setSuccess(false);
            resp.setMessage("missing-credentials");
            return resp;
        }

        Optional<User> optUser = userRepository.findByEmail(identifier)
                .or(() -> userRepository.findByUsername(identifier));

        if (optUser.isEmpty()) {
            resp.setSuccess(false);
            resp.setMessage("user-not-found");
            return resp;
        }

        User user = optUser.get();

        // Blocked account check
        if (Boolean.TRUE.equals(user.getIsBlocked())) {
            resp.setSuccess(false);
            resp.setMessage("account-blocked");
            resp.setBlocked(true);
            resp.setRemainingAttempts(0);
            return resp;
        }

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            int attempts = (user.getLoginAttempts() == null) ? 0 : user.getLoginAttempts();
            attempts++;
            user.setLoginAttempts(attempts);

            int max = Math.max(1, maxLoginAttempts);
            int remaining = Math.max(0, max - attempts);
            resp.setRemainingAttempts(remaining);

            if (attempts >= max) {
                user.setIsBlocked(true);
                user.setBlockedAt(LocalDateTime.now());
                resp.setBlocked(true);
                resp.setMessage("account-blocked");
            } else {
                resp.setBlocked(false);
                resp.setMessage("invalid-credentials");
            }
            userRepository.save(user);
            resp.setSuccess(false);
            return resp;
        }

        // Successful login -> reset counters
        user.setLoginAttempts(0);
        user.setIsBlocked(false);
        user.setBlockedAt(null);
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        resp.setSuccess(true);
        resp.setMessage("local-login-ok");
        resp.setUserId(user.getId());
        resp.setUsername(user.getUsername());
        resp.setEmail(user.getEmail());
        resp.setTypeName(user.getTypeUser() != null ? user.getTypeUser().getName() : "USER");

        // Issue local session token (JWT)
        String token = jwtService.issueToken(user);
        resp.setToken(token);
        resp.setTokenExp(java.time.Instant.now().getEpochSecond() + jwtService.getSessionTtlSeconds());
        resp.setBlocked(false);
        resp.setRemainingAttempts(Math.max(0, Math.max(1, maxLoginAttempts)));
        return resp;
    }

    @Override
    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest request) {
        AuthDtos.AuthResponse resp = new AuthDtos.AuthResponse();

        if (request.getUsername() == null || request.getEmail() == null || request.getPassword() == null) {
            resp.setSuccess(false);
            resp.setMessage("missing-registration-fields");
            return resp;
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            resp.setSuccess(false);
            resp.setMessage("email-already-used");
            return resp;
        }

        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            resp.setSuccess(false);
            resp.setMessage("username-already-used");
            return resp;
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setLastLogin(LocalDateTime.now());
        // Ensure a TypeUser is set (non-nullable relation)
        TypeUser defaultType = getOrCreateTypeByName("USER");
        user.setTypeUser(defaultType);

        user = userRepository.save(user);

        resp.setSuccess(true);
        resp.setMessage("local-register-ok");
        resp.setUserId(user.getId());
        resp.setUsername(user.getUsername());
        resp.setEmail(user.getEmail());
        resp.setTypeName(user.getTypeUser() != null ? user.getTypeUser().getName() : "USER");

        // Issue local session token (JWT)
        String token = jwtService.issueToken(user);
        resp.setToken(token);
        resp.setTokenExp(java.time.Instant.now().getEpochSecond() + jwtService.getSessionTtlSeconds());
        resp.setBlocked(false);
        resp.setRemainingAttempts(Math.max(0, Math.max(1, maxLoginAttempts)));
        return resp;
    }

    @Override
    public AuthDtos.AuthResponse updateUser(Long userId, AuthDtos.UpdateUserRequest request) {
        AuthDtos.AuthResponse resp = new AuthDtos.AuthResponse();

        Optional<User> optUser = userRepository.findById(userId);
        if (optUser.isEmpty()) {
            resp.setSuccess(false);
            resp.setMessage("user-not-found");
            return resp;
        }

        User user = optUser.get();
        if (request.getUsername() != null) {
            user.setUsername(request.getUsername());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }

        user = userRepository.save(user);

        resp.setSuccess(true);
        resp.setMessage("local-update-ok");
        resp.setUserId(user.getId());
        resp.setUsername(user.getUsername());
        resp.setEmail(user.getEmail());
        resp.setTypeName(user.getTypeUser() != null ? user.getTypeUser().getName() : "USER");
        return resp;
    }

    private TypeUser getOrCreateTypeByName(String name) {
        String wanted = (name == null || name.isBlank()) ? "USER" : name.toUpperCase();
        return typeUserRepository.findByName(wanted).orElseGet(() -> {
            TypeUser t = new TypeUser();
            t.setName(wanted);
            return typeUserRepository.save(t);
        });
    }
}
