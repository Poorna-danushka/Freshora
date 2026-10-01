package Freshora.Backend.application.repository;

import Freshora.Backend.application.entity.ApplicationDocument;
import Freshora.Backend.application.entity.ApplicationType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ApplicationDocumentRepository extends JpaRepository<ApplicationDocument, Long> {
    List<ApplicationDocument> findByApplicationTypeAndApplicationId(ApplicationType type, Long applicationId);
}
