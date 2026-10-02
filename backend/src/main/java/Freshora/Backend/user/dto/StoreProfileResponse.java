package Freshora.Backend.user.dto;

import java.util.UUID;

public record StoreProfileResponse(
        UUID userId,
        String email,
        String phone,
        String storeName,
        String storeStatus,
        String storeAddress,
        String role
) {}
