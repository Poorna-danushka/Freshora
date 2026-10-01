package Freshora.Backend.application.repository;

import Freshora.Backend.application.entity.ApplicationStatus;
import Freshora.Backend.application.entity.StoreApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Collection;
import java.util.Optional;

public interface StoreApplicationRepository extends JpaRepository<StoreApplication, Long> {
    boolean existsByEmailAndStatusIn(String email, Collection<ApplicationStatus> statuses);
    Optional<StoreApplication> findByIdAndApplicant_Email(Long id, String email);
}
