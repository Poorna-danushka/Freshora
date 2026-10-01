package Freshora.Backend.order.repository;

import Freshora.Backend.order.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {
    long countByOrder_Id(UUID orderId);

    List<OrderItem> findAllByOrder_Id(UUID orderId);

    List<OrderItem> findAllByOrder_IdIn(Collection<UUID> orderIds);
}
