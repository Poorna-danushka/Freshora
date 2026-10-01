package Freshora.Backend.auth.repository;

import Freshora.Backend.auth.entity.AccountSetupToken;
import Freshora.Backend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccountSetupTokenRepository extends JpaRepository<AccountSetupToken, Long> {
    List<AccountSetupToken> findByUserOrderByCreatedAtDesc(User user);
    void deleteByUser(User user);
}
