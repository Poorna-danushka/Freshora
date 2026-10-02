package Freshora.Backend.order.repository;

import Freshora.Backend.order.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {
    long countByCustomer_Id(UUID customerId);

    Page<Order> findByCustomer_Id(UUID customerId, Pageable pageable);
}
