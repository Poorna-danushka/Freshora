package Freshora.Backend.user.dto;

public record StoreProfileResponse(
        Long userId,
        String email,
        String phone,
        String storeName,
        String storeStatus,
        String storeAddress,
        String role
) {}
