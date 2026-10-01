package Freshora.Backend.order.entity;

public enum OrderStatus {
    CREATED,
    PAYMENT_PENDING,
    CONFIRMED,
    ACCEPTED,
    PACKING,
    READY_FOR_PICKUP,
    DRIVER_ASSIGNED,
    PICKED_UP,
    OUT_FOR_DELIVERY,
    DELIVERED,
    PAYMENT_FAILED,
    CANCELLED,
    EXPIRED,
    REFUNDED
}
