package Freshora.Backend.order.service;

import Freshora.Backend.order.dto.OrderResponse;
import Freshora.Backend.order.entity.Order;
import Freshora.Backend.order.entity.OrderItem;

import java.util.List;

public final class OrderResponseMapper {
    private OrderResponseMapper() {
    }

    public static OrderResponse toResponse(Order order, List<OrderItem> items) {
        return new OrderResponse(order.getId(), order.getOrderNumber(), order.getStatus(), order.getSubtotal(),
                order.getDeliveryFee(), order.getDiscountAmount(), order.getTotalAmount(), order.getVersion(),
                order.getCreatedAt(), items.stream().map(item -> new OrderResponse.Item(
                item.getProductId(), item.getProductName(), item.getUnitPrice(), item.getQuantity(),
                item.getLineTotal())).toList());
    }
}
