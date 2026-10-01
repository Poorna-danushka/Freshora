package Freshora.Backend.auth.repository;

import Freshora.Backend.auth.entity.PasswordResetToken;
import Freshora.Backend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    List<PasswordResetToken> findByUserOrderByCreatedAtDesc(User user);
    List<PasswordResetToken> findByUsedAtIsNullAndExpiresAtAfterOrderByCreatedAtDesc(Instant now);
    void deleteByUser(User user);
}
