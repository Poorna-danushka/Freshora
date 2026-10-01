package Freshora.Backend.order.repository;

import Freshora.Backend.order.entity.IdempotencyRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface IdempotencyRecordRepository extends JpaRepository<IdempotencyRecord, UUID> {
    Optional<IdempotencyRecord> findByUser_IdAndIdemKeyAndOperation(Long userId, String idemKey, String operation);

    long countByUser_Id(Long userId);
}
