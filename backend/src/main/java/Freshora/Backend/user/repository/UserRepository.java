package Freshora.Backend.user.repository;

import Freshora.Backend.user.entity.Role;
import Freshora.Backend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    Optional<User> findByPhone(String phone);

    @Query("SELECT COUNT(u) > 0 FROM User u JOIN u.roles r WHERE r.name = :role")
    boolean existsByRole(@Param("role") Role role);
}
