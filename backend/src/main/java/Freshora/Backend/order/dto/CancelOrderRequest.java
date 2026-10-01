package Freshora.Backend.order.dto;

import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.NotNull;

public record CancelOrderRequest(@NotNull @PositiveOrZero Integer expectedVersion) {
}
