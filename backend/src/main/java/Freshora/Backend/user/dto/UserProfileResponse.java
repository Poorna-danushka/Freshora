package Freshora.Backend.user.dto;

public record UserProfileResponse(
        Long id,
        String firstName,
        String lastName,
        String name,
        String email,
        String phone,
        String role,
        String accountStatus,
        String profileImageUrl
) {}
