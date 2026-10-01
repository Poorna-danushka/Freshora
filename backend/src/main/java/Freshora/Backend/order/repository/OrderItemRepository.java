package Freshora.Backend.order.repository;

import Freshora.Backend.order.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {
    long countByOrder_Id(UUID orderId);
}
