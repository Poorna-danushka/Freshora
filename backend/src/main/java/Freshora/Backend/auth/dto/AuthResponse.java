package Freshora.Backend.auth.dto;

public record AuthResponse(
        String message,
        UserResponse user
) {}
