package Freshora.Backend.user.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record AddressResponse(
        UUID id,
        String label,
        String recipientName,
        String phone,
        String addressLine1,
        String addressLine2,
        String city,
        String district,
        String postalCode,
        BigDecimal latitude,
        BigDecimal longitude,
        boolean isDefault,
        Instant createdAt,
        Instant updatedAt
) {
    public AddressResponse(
            UUID id,
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
    ) {
        this(
                id,
                label,
                recipientName,
                phone,
                addressLine1,
                addressLine2,
                city,
                district,
                postalCode,
                latitude != null ? BigDecimal.valueOf(latitude) : null,
                longitude != null ? BigDecimal.valueOf(longitude) : null,
                isDefault,
                createdAt,
                updatedAt
        );
    }
}
