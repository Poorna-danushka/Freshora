package Freshora.Backend.auth.dto;

import java.util.Set;
import java.util.UUID;

/**
 * User response DTO with role-based dashboard routing information
 */
public record UserResponse(
        UUID id,
        String name,
        String email,
        String phone,
        String profileImageUrl,
        String status,
        Set<String> roles,
        String primaryDashboard,
        Set<String> availableDashboards
) {
    public UserResponse(UUID id, String firstName, String lastName, String email, Freshora.Backend.user.entity.Role role) {
        this(
                id,
                ((firstName == null ? "" : firstName.trim()) + " " + (lastName == null ? "" : lastName.trim())).trim(),
                email,
                null,
                null,
                "ACTIVE",
                role == null ? Set.of("CUSTOMER") : Set.of(role.name()),
                null,
                null
        );
    }

    public UserResponse(Long id, String firstName, String lastName, String email, Freshora.Backend.user.entity.Role role) {
        this(
                id == null ? null : new UUID(0L, id),
                ((firstName == null ? "" : firstName.trim()) + " " + (lastName == null ? "" : lastName.trim())).trim(),
                email,
                null,
                null,
                "ACTIVE",
                role == null ? Set.of("CUSTOMER") : Set.of(role.name()),
                null,
                null
        );
    }

    public String firstName() {
        if (name == null) return "";
        int idx = name.indexOf(' ');
        return idx >= 0 ? name.substring(0, idx) : name;
    }

    public String lastName() {
        if (name == null) return "";
        int idx = name.indexOf(' ');
        return idx >= 0 ? name.substring(idx + 1) : "";
    }

    public String accountStatus() {
        return status;
    }

    public Freshora.Backend.user.entity.Role role() {
        if (roles == null || roles.isEmpty()) return Freshora.Backend.user.entity.Role.CUSTOMER;
        return roles.stream()
                .findFirst()
                .map(Freshora.Backend.user.entity.Role::valueOf)
                .orElse(Freshora.Backend.user.entity.Role.CUSTOMER);
    }
}
