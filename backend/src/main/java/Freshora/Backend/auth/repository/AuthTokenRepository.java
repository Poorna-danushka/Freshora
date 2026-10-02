package Freshora.Backend.auth.repository;

import Freshora.Backend.auth.entity.AuthToken;
import Freshora.Backend.auth.entity.AuthTokenType;
import Freshora.Backend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AuthTokenRepository extends JpaRepository<AuthToken, UUID> {
    Optional<AuthToken> findByTokenHash(String tokenHash);
    Optional<AuthToken> findByTokenHashAndType(String tokenHash, AuthTokenType type);
    List<AuthToken> findByUserAndType(User user, AuthTokenType type);
    List<AuthToken> findByUser(User user);
    void deleteByUser(User user);
    void deleteByUserAndType(User user, AuthTokenType type);
    void deleteByExpiresAtBefore(Instant now);
}
