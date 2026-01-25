package com.example.travauxroutiers.service;

import com.example.travauxroutiers.model.User;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;

@Service
public class JwtService {

    private final ObjectMapper objectMapper;
    private final String jwtSecret;
    private final long sessionTtlSeconds;

    public JwtService(
            ObjectMapper objectMapper,
            @Value("${app.security.jwt-secret:dev-secret-change-me}") String jwtSecret,
            @Value("${app.security.session-ttl-minutes:60}") long sessionTtlMinutes
    ) {
        this.objectMapper = objectMapper;
        this.jwtSecret = jwtSecret;
        this.sessionTtlSeconds = Math.max(60, sessionTtlMinutes * 60);
    }

    public record JwtClaims(Long userId, String username, String typeName, long expEpochSeconds) {}

    public String issueToken(User user) {
        long now = Instant.now().getEpochSecond();
        long exp = now + sessionTtlSeconds;

        Map<String, Object> header = Map.of(
                "alg", "HS256",
                "typ", "JWT"
        );

        Map<String, Object> payload = Map.of(
                "sub", String.valueOf(user.getId()),
                "username", user.getUsername(),
                "typeName", (user.getTypeUser() != null ? user.getTypeUser().getName() : "USER"),
                "exp", exp
        );

        String headerB64 = base64Url(toJsonBytes(header));
        String payloadB64 = base64Url(toJsonBytes(payload));
        String signingInput = headerB64 + "." + payloadB64;
        String sigB64 = base64Url(hmacSha256(signingInput.getBytes(StandardCharsets.UTF_8)));

        return signingInput + "." + sigB64;
    }

    public long getSessionTtlSeconds() {
        return sessionTtlSeconds;
    }

    public Optional<JwtClaims> tryVerify(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) return Optional.empty();

            String headerB64 = parts[0];
            String payloadB64 = parts[1];
            String sigB64 = parts[2];

            String signingInput = headerB64 + "." + payloadB64;
            String expectedSigB64 = base64Url(hmacSha256(signingInput.getBytes(StandardCharsets.UTF_8)));
            if (!constantTimeEquals(sigB64, expectedSigB64)) return Optional.empty();

            byte[] payloadBytes = Base64.getUrlDecoder().decode(payloadB64);
            Map<String, Object> payload = objectMapper.readValue(payloadBytes, new TypeReference<>() {});

            Object subObj = payload.get("sub");
            Object expObj = payload.get("exp");
            if (!(subObj instanceof String) || expObj == null) return Optional.empty();

            long exp = (expObj instanceof Number) ? ((Number) expObj).longValue() : Long.parseLong(String.valueOf(expObj));
            long now = Instant.now().getEpochSecond();
            if (exp <= now) return Optional.empty();

            Long userId = Long.parseLong((String) subObj);
            String username = payload.get("username") instanceof String ? (String) payload.get("username") : null;
            String typeName = payload.get("typeName") instanceof String ? (String) payload.get("typeName") : null;

            return Optional.of(new JwtClaims(userId, username, typeName, exp));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    private byte[] toJsonBytes(Object value) {
        try {
            return objectMapper.writeValueAsBytes(value);
        } catch (Exception e) {
            throw new IllegalStateException("JWT json encode failed", e);
        }
    }

    private byte[] hmacSha256(byte[] value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(jwtSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return mac.doFinal(value);
        } catch (Exception e) {
            throw new IllegalStateException("JWT hmac failed", e);
        }
    }

    private static String base64Url(byte[] bytes) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null) return false;
        if (a.length() != b.length()) return false;
        int result = 0;
        for (int i = 0; i < a.length(); i++) {
            result |= a.charAt(i) ^ b.charAt(i);
        }
        return result == 0;
    }
}
