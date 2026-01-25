package com.example.travauxroutiers.controller;

import com.example.travauxroutiers.dto.AdminDtos;
import com.example.travauxroutiers.model.TypeUser;
import com.example.travauxroutiers.model.User;
import com.example.travauxroutiers.repository.TypeUserRepository;
import com.example.travauxroutiers.repository.UserRepository;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.UserRecord.CreateRequest;
import com.google.firebase.auth.UserRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);
    private final UserRepository userRepository;
    private final TypeUserRepository typeUserRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminController(UserRepository userRepository, TypeUserRepository typeUserRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.typeUserRepository = typeUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestHeader(value = "X-ADMIN-KEY", required = false) String adminKey,
                                        @RequestBody AdminDtos.CreateUserRequest req) {
        String expected = System.getenv("ADMIN_API_KEY");
        if (expected == null || expected.isEmpty() || adminKey == null || !adminKey.equals(expected)) {
            return ResponseEntity.status(403).body(Map.of("message", "forbidden"));
        }

        AdminDtos.CreateUserResponse resp = new AdminDtos.CreateUserResponse();

        String email = req.getEmail();
        String password = req.getPassword();
        String username = req.getUsername();
        String role = (req.getRole() == null || req.getRole().isBlank()) ? "USER" : req.getRole().toUpperCase();

        if (email == null || email.isBlank() || password == null || password.isBlank() || username == null || username.isBlank()) {
            resp.setSuccess(false);
            resp.setMessage("missing-fields");
            return ResponseEntity.badRequest().body(resp);
        }
        if (!role.equals("USER") && !role.equals("MANAGER")) {
            resp.setSuccess(false);
            resp.setMessage("invalid-role");
            return ResponseEntity.badRequest().body(resp);
        }

        // Prevent local username collisions early
        if (userRepository.findByUsername(username).isPresent()) {
            resp.setSuccess(false);
            resp.setMessage("username-already-used");
            return ResponseEntity.badRequest().body(resp);
        }

        try {
            // 1) Create Firebase user
            CreateRequest createReq = new CreateRequest()
                    .setEmail(email)
                    .setEmailVerified(false)
                    .setPassword(password)
                    .setDisplayName(username)
                    .setDisabled(false);

            UserRecord created = FirebaseAuth.getInstance().createUser(createReq);
            String uid = created.getUid();

            // 2) Set custom claim role
            FirebaseAuth.getInstance().setCustomUserClaims(uid, Map.of("role", role));

            // 3) Create/update local mirror user
            TypeUser type = typeUserRepository.findByName(role).orElseGet(() -> {
                TypeUser t = new TypeUser();
                t.setName(role);
                return typeUserRepository.save(t);
            });

            Optional<User> existingLocal = userRepository.findByEmail(email);
            User localUser = existingLocal.orElseGet(User::new);
            localUser.setEmail(email);
            localUser.setUsername(username);
            localUser.setTypeUser(type);
            // local password is not used in cloud mode, but column is NOT NULL
            if (localUser.getPasswordHash() == null || localUser.getPasswordHash().isBlank()) {
                localUser.setPasswordHash(passwordEncoder.encode("firebase"));
            }
            localUser = userRepository.save(localUser);

            resp.setSuccess(true);
            resp.setMessage("user-created");
            resp.setUserId(localUser.getId());
            resp.setFirebaseUid(uid);
            resp.setUsername(localUser.getUsername());
            resp.setEmail(localUser.getEmail());
            resp.setTypeName(type.getName());
            return ResponseEntity.status(201).body(resp);
        } catch (Exception e) {
            logger.warn("Admin create user failed: {}", e.getMessage());
            resp.setSuccess(false);
            resp.setMessage("create-user-error: " + e.getMessage());
            return ResponseEntity.badRequest().body(resp);
        }
    }

    @PostMapping("/users/{id}/role")
    public ResponseEntity<?> assignRole(@RequestHeader(value = "X-ADMIN-KEY", required = false) String adminKey,
                                        @PathVariable("id") Long userId,
                                        @RequestBody AdminDtos.RoleRequest req) {
        String expected = System.getenv("ADMIN_API_KEY");
        if (expected == null || expected.isEmpty() || adminKey == null || !adminKey.equals(expected)) {
            return ResponseEntity.status(403).body(Map.of("message", "forbidden"));
        }

        return userRepository.findById(userId).map(user -> {
            String role = (req.getRole() == null) ? "USER" : req.getRole().toUpperCase();
            TypeUser type = typeUserRepository.findByName(role).orElseGet(() -> {
                TypeUser t = new TypeUser(); t.setName(role); return typeUserRepository.save(t);
            });
            user.setTypeUser(type);
            userRepository.save(user);

            // try to update Firebase custom claim if available
            try {
                if (user.getEmail() != null) {
                    UserRecord fr = FirebaseAuth.getInstance().getUserByEmail(user.getEmail());
                    if (fr != null) {
                        FirebaseAuth.getInstance().setCustomUserClaims(fr.getUid(), Map.of("role", type.getName()));
                    }
                }
            } catch (Exception e) {
                logger.warn("Could not set Firebase custom claim for user {}: {}", user.getEmail(), e.getMessage());
            }

            return ResponseEntity.ok(Map.of("message", "role-updated", "role", type.getName()));
        }).orElseGet(() -> ResponseEntity.status(404).body(Map.of("message", "user-not-found")));
    }

    @PostMapping("/users/{id}/unblock")
    public ResponseEntity<?> unblockUser(@RequestHeader(value = "X-ADMIN-KEY", required = false) String adminKey,
                                         @PathVariable("id") Long userId) {
        String expected = System.getenv("ADMIN_API_KEY");
        if (expected == null || expected.isEmpty() || adminKey == null || !adminKey.equals(expected)) {
            return ResponseEntity.status(403).body(Map.of("message", "forbidden"));
        }

        return userRepository.findById(userId)
                .map(user -> {
                    user.setLoginAttempts(0);
                    user.setIsBlocked(false);
                    user.setBlockedAt(null);
                    userRepository.save(user);
                    return ResponseEntity.ok(Map.of("success", true, "message", "user-unblocked", "userId", user.getId()));
                })
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("success", false, "message", "user-not-found")));
    }
}
