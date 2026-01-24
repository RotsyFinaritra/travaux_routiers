package com.example.travauxroutiers.controller;

import com.example.travauxroutiers.dto.AdminDtos;
import com.example.travauxroutiers.model.TypeUser;
import com.example.travauxroutiers.model.User;
import com.example.travauxroutiers.repository.TypeUserRepository;
import com.example.travauxroutiers.repository.UserRepository;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.UserRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);
    private final UserRepository userRepository;
    private final TypeUserRepository typeUserRepository;

    public AdminController(UserRepository userRepository, TypeUserRepository typeUserRepository) {
        this.userRepository = userRepository;
        this.typeUserRepository = typeUserRepository;
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
}
