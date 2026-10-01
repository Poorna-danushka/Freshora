package Freshora.Backend.order.repository;

import Freshora.Backend.order.entity.OutboxEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface OutboxEventRepository extends JpaRepository<OutboxEvent, UUID> {
    long countByAggregateId(UUID aggregateId);
}
