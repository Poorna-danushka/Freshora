package Freshora.Backend.user.dto;

public record DriverProfileResponse(
        Long userId,
        String email,
        String phone,
        String driverName,
        String status,
        String vehicleType,
        String preferredArea,
        String role
) {}
