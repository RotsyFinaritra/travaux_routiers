package com.example.travauxroutiers.service;

import com.example.travauxroutiers.dto.AuthDtos;
import com.example.travauxroutiers.model.User;
import com.example.travauxroutiers.repository.UserRepository;
import com.example.travauxroutiers.repository.TypeUserRepository;
import com.example.travauxroutiers.model.TypeUser;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Profile("cloud")
public class FirebaseAuthProvider implements AuthProvider {

    private static final Logger logger = LoggerFactory.getLogger(FirebaseAuthProvider.class);

    private final UserRepository userRepository;
    private final TypeUserRepository typeUserRepository;
    private final PasswordEncoder passwordEncoder;

    public FirebaseAuthProvider(UserRepository userRepository, TypeUserRepository typeUserRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.typeUserRepository = typeUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request) {
        AuthDtos.AuthResponse resp = new AuthDtos.AuthResponse();

        String idToken = request.getIdToken();
        if (idToken == null || idToken.isBlank()) {
            resp.setSuccess(false);
            resp.setMessage("missing-idToken");
            return resp;
        }

        try {
            FirebaseToken decoded = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String email = decoded.getEmail();
            String username = decoded.getUid();

            Optional<User> existing = (email != null)
                    ? userRepository.findByEmail(email)
                    : userRepository.findByUsername(username);

            // check role claim
            Object roleObj = decoded.getClaims().get("role");
            String roleName = (roleObj instanceof String) ? ((String) roleObj).toUpperCase() : null;

            User user = existing.orElseGet(() -> {
                User u = new User();
                u.setUsername(username);
                u.setEmail(email != null ? email : username + "@firebase");
                u.setPasswordHash(passwordEncoder.encode("firebase"));
                u.setLastLogin(LocalDateTime.now());
                // set TypeUser based on claim or default USER
                TypeUser type = getOrCreateTypeByName(roleName != null ? roleName : "USER");
                u.setTypeUser(type);
                return userRepository.save(u);
            });

            // Enforce local block status (if an admin blocked the account)
            if (Boolean.TRUE.equals(user.getIsBlocked())) {
                resp.setSuccess(false);
                resp.setMessage("account-blocked");
                resp.setBlocked(true);
                resp.setRemainingAttempts(0);
                resp.setLoginAttempts(user.getLoginAttempts());
                resp.setBlockedAt(user.getBlockedAt());
                resp.setLastLogin(user.getLastLogin());
                resp.setTypeUserId(user.getTypeUser() != null ? user.getTypeUser().getId() : null);
                return resp;
            }

            // if existing and claim present, ensure type matches
            if (roleName != null) {
                TypeUser wanted = getOrCreateTypeByName(roleName);
                if (user.getTypeUser() == null || !wanted.getName().equalsIgnoreCase(user.getTypeUser().getName())) {
                    user.setTypeUser(wanted);
                }
            }

            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);

            resp.setSuccess(true);
            resp.setMessage("firebase-login-ok");
            resp.setUserId(user.getId());
            resp.setUsername(user.getUsername());
            resp.setEmail(user.getEmail());
            resp.setTypeName(user.getTypeUser() != null ? user.getTypeUser().getName() : "USER");
            resp.setLoginAttempts(user.getLoginAttempts());
            resp.setBlockedAt(user.getBlockedAt());
            resp.setLastLogin(user.getLastLogin());
            resp.setTypeUserId(user.getTypeUser() != null ? user.getTypeUser().getId() : null);
        } catch (Exception e) {
            logger.error("Firebase login failed", e);
            resp.setSuccess(false);
            resp.setMessage("firebase-login-error: " + e.getMessage());
        }
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

    @Override
    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest request) {
        // In Firebase mode, registration is usually handled client-side.
        // Here we simply ensure the local mirror exists by requiring an idToken
        // and delegating to login, so the user row is created/updated.
        AuthDtos.LoginRequest loginReq = new AuthDtos.LoginRequest();
        loginReq.setIdToken(request.getPassword()); // convention: carry idToken via password field if needed
        return login(loginReq);
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
        resp.setMessage("firebase-update-ok");
        resp.setUserId(user.getId());
        resp.setUsername(user.getUsername());
        resp.setEmail(user.getEmail());
        resp.setTypeName(user.getTypeUser() != null ? user.getTypeUser().getName() : "USER");
        return resp;
    }
}
