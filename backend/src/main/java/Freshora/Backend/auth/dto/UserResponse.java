package Freshora.Backend.auth.dto;

import Freshora.Backend.user.entity.Role;

public record UserResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        Role role
) {}
