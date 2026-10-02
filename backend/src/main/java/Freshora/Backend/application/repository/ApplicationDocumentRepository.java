package Freshora.Backend.application.repository;

import Freshora.Backend.application.entity.ApplicationDocument;
import Freshora.Backend.application.entity.ApplicationType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ApplicationDocumentRepository extends JpaRepository<ApplicationDocument, UUID> {
    List<ApplicationDocument> findByApplicationTypeAndApplicationId(ApplicationType type, UUID applicationId);
}
