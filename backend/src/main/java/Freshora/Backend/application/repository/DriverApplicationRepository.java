package Freshora.Backend.application.repository;

import Freshora.Backend.application.entity.ApplicationStatus;
import Freshora.Backend.application.entity.DriverApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Collection;
import java.util.Optional;

public interface DriverApplicationRepository extends JpaRepository<DriverApplication, Long> {
    boolean existsByEmailAndStatusIn(String email, Collection<ApplicationStatus> statuses);
    Optional<DriverApplication> findByIdAndApplicant_Email(Long id, String email);
}
