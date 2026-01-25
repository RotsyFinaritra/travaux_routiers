package com.example.travauxroutiers.dto;

public class AdminDtos {
    public static class RoleRequest {
        private String role;

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }

    public static class CreateUserRequest {
        private String username;
        private String email;
        private String password;
        /** USER or MANAGER (default USER). */
        private String role;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }

    public static class CreateUserResponse {
        private boolean success;
        private String message;
        private Long userId;
        private String firebaseUid;
        private String username;
        private String email;
        private String typeName;

        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getFirebaseUid() { return firebaseUid; }
        public void setFirebaseUid(String firebaseUid) { this.firebaseUid = firebaseUid; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getTypeName() { return typeName; }
        public void setTypeName(String typeName) { this.typeName = typeName; }
    }
}
