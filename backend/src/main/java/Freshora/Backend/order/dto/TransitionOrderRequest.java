package Freshora.Backend.order.dto;

import Freshora.Backend.order.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record TransitionOrderRequest(
        @NotNull OrderStatus targetStatus,
        @NotNull @PositiveOrZero Integer expectedVersion
) {
}
