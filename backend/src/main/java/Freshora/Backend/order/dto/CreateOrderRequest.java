package Freshora.Backend.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record CreateOrderRequest(
        @NotNull UUID storeId,
        @NotNull Long addressId,
        String couponCode,
        @NotNull PaymentMethod paymentMethod,
        @NotEmpty List<@Valid Item> items
) {
    public record Item(@NotNull UUID productId, @NotNull @Min(1) Integer quantity) {
    }

    public enum PaymentMethod {
        CARD,
        CASH_ON_DELIVERY
    }
}
