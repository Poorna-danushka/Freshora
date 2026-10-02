package Freshora.Backend.user.dto;

import java.util.UUID;

public record UserProfileResponse(
        UUID id,
        String firstName,
        String lastName,
        String name,
        String email,
        String phone,
        String role,
        String accountStatus,
        String profileImageUrl
) {}
