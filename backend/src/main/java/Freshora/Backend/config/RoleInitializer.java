package Freshora.Backend.config;

import Freshora.Backend.user.entity.Role;
import Freshora.Backend.user.entity.RoleEntity;
import Freshora.Backend.user.repository.RoleRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RoleInitializer implements ApplicationRunner {

    private final RoleRepository roleRepository;

    public RoleInitializer(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        for (Role role : Role.values()) {
            if (!roleRepository.existsByName(role)) {
                roleRepository.save(new RoleEntity(role));
            }
        }
    }
}
