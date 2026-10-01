package Freshora.Backend.user.dto;

import java.time.Instant;

public record AddressResponse(
        Long id,
        String label,
        String recipientName,
        String phone,
        String addressLine1,
        String addressLine2,
        String city,
        String district,
        String postalCode,
        Double latitude,
        Double longitude,
        boolean isDefault,
        Instant createdAt,
        Instant updatedAt
) {}
