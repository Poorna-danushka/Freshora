package Freshora.Backend.order.entity;

import java.util.Map;
import java.util.Set;

public enum OrderStatus {
    CREATED,
    PAYMENT_PENDING,
    PAYMENT_FAILED,
    CONFIRMED,
    ACCEPTED,
    PACKING,
    READY_FOR_PICKUP,
    DRIVER_ASSIGNED,
    PICKED_UP,
    OUT_FOR_DELIVERY,
    DELIVERED,
    CANCELLED,
    EXPIRED,
    REFUNDED;

    private static final Map<OrderStatus, Set<OrderStatus>> ALLOWED_TRANSITIONS = Map.ofEntries(
            Map.entry(CREATED, Set.of(PAYMENT_PENDING, PAYMENT_FAILED, CONFIRMED, CANCELLED, EXPIRED)),
            Map.entry(PAYMENT_PENDING, Set.of(PAYMENT_FAILED, CONFIRMED, CANCELLED, EXPIRED)),
            Map.entry(PAYMENT_FAILED, Set.of(PAYMENT_PENDING, EXPIRED)),
            Map.entry(CONFIRMED, Set.of(ACCEPTED, CANCELLED)),
            Map.entry(ACCEPTED, Set.of(PACKING)),
            Map.entry(PACKING, Set.of(READY_FOR_PICKUP)),
            Map.entry(READY_FOR_PICKUP, Set.of(DRIVER_ASSIGNED)),
            Map.entry(DRIVER_ASSIGNED, Set.of(PICKED_UP)),
            Map.entry(PICKED_UP, Set.of(OUT_FOR_DELIVERY)),
            Map.entry(OUT_FOR_DELIVERY, Set.of(DELIVERED)),
            Map.entry(DELIVERED, Set.of(REFUNDED))
    );

    public boolean canTransitionTo(OrderStatus target) {
        return target != null && ALLOWED_TRANSITIONS.getOrDefault(this, Set.of()).contains(target);
    }
}
