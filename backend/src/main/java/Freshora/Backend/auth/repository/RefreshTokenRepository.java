package Freshora.Backend.auth.repository;

import Freshora.Backend.auth.entity.RefreshToken;
import Freshora.Backend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByTokenId(String tokenId);

    List<RefreshToken> findByUser(User user);

    void deleteByUser(User user);
}
