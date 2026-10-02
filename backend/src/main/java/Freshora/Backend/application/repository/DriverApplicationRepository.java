package Freshora.Backend.application.repository;

import Freshora.Backend.application.entity.ApplicationStatus;
import Freshora.Backend.application.entity.DriverApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DriverApplicationRepository extends JpaRepository<DriverApplication, UUID> {
    boolean existsByEmailAndStatusIn(String email, Collection<ApplicationStatus> statuses);
    boolean existsByEmailAndStatusInAndIdNot(String email, Collection<ApplicationStatus> statuses, UUID id);
    List<DriverApplication> findByApplicant_IdOrderBySubmittedAtDesc(UUID applicantId);
    Optional<DriverApplication> findByIdAndApplicant_Email(UUID id, String email);
}
