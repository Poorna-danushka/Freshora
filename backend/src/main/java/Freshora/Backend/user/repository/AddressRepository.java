package Freshora.Backend.user.repository;

import Freshora.Backend.user.entity.Address;
import Freshora.Backend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByUserOrderByIsDefaultDescCreatedAtDesc(User user);
    Optional<Address> findByUserAndId(User user, Long id);
    Optional<Address> findByUserAndIsDefaultTrue(User user);
    long countByUser(User user);
}
