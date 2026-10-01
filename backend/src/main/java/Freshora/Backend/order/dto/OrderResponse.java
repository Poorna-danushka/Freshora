package Freshora.Backend.order.dto;

import Freshora.Backend.order.entity.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record OrderResponse(
        UUID id,
        String orderNumber,
        OrderStatus status,
        BigDecimal subtotal,
        BigDecimal deliveryFee,
        BigDecimal discountAmount,
        BigDecimal totalAmount,
        int version,
        Instant createdAt,
        List<Item> items
) {
    public record Item(UUID productId, String productName, BigDecimal unitPrice, int quantity, BigDecimal lineTotal) {
    }
}
