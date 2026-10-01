package Freshora.Backend.application.repository;

import Freshora.Backend.application.entity.ApplicationReviewHistory;
import Freshora.Backend.application.entity.ApplicationType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ApplicationReviewHistoryRepository extends JpaRepository<ApplicationReviewHistory, Long> {
    List<ApplicationReviewHistory> findByApplicationTypeAndApplicationIdOrderByCreatedAtAsc(ApplicationType type, Long applicationId);
}
