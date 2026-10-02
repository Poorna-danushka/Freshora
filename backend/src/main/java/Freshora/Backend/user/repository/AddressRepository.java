package Freshora.Backend.user.repository;

import Freshora.Backend.user.entity.Address;
import Freshora.Backend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AddressRepository extends JpaRepository<Address, UUID> {
    List<Address> findByUserOrderByCreatedAtDesc(User user);
    Optional<Address> findByUserAndId(User user, UUID id);
    long countByUser(User user);
}
