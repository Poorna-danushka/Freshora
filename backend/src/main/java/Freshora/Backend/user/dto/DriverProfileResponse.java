package Freshora.Backend.user.dto;

import java.util.UUID;

public record DriverProfileResponse(
        UUID userId,
        String email,
        String phone,
        String driverName,
        String status,
        String vehicleType,
        String preferredArea,
        String role
) {}
