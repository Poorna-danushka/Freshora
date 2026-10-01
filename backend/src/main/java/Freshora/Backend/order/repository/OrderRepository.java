package Freshora.Backend.order.repository;

import Freshora.Backend.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {
    long countByCustomer_Id(Long customerId);
}
