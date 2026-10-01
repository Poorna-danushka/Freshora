package Freshora.Backend.order.repository;

import Freshora.Backend.order.entity.OrderEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface OrderEventRepository extends JpaRepository<OrderEvent, UUID> {
    long countByOrder_Id(UUID orderId);
}
