package Freshora.Backend.order.config;

import Freshora.Backend.order.entity.OrderStatus;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.EnumSet;
import java.util.Objects;
import java.util.Set;

@Component
@ConfigurationProperties(prefix = "freshora.orders")
public class OrderLifecycleProperties {
    private Set<OrderStatus> cancellableStates = EnumSet.of(
            OrderStatus.CREATED,
            OrderStatus.PAYMENT_PENDING,
            OrderStatus.CONFIRMED
    );

    public Set<OrderStatus> getCancellableStates() {
        return cancellableStates;
    }

    public void setCancellableStates(Set<OrderStatus> cancellableStates) {
        this.cancellableStates = Set.copyOf(Objects.requireNonNull(cancellableStates));
    }
}
