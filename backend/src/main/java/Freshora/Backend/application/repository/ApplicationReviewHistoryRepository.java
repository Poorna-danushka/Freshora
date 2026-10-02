package Freshora.Backend.application.repository;

import Freshora.Backend.application.entity.ApplicationReviewHistory;
import Freshora.Backend.application.entity.ApplicationType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ApplicationReviewHistoryRepository extends JpaRepository<ApplicationReviewHistory, UUID> {
    List<ApplicationReviewHistory> findByApplicationTypeAndApplicationIdOrderByCreatedAtAsc(ApplicationType type, UUID applicationId);
}
