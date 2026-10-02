package Freshora.Backend.config;

import Freshora.Backend.user.entity.AccountStatus;
import Freshora.Backend.user.entity.Role;
import Freshora.Backend.user.entity.RoleEntity;
import Freshora.Backend.user.entity.User;
import Freshora.Backend.user.repository.RoleRepository;
import Freshora.Backend.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

@Component
public class AdminBootstrapRunner implements ApplicationRunner {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;

    public AdminBootstrapRunner(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            String adminEmail,
            String adminPassword) {
        this(userRepository, null, passwordEncoder, adminEmail, adminPassword);
    }

    @org.springframework.beans.factory.annotation.Autowired
    public AdminBootstrapRunner(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            @Value("${freshora.admin.email:}") String adminEmail,
            @Value("${freshora.admin.password:}") String adminPassword) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!StringUtils.hasText(adminEmail) || !StringUtils.hasText(adminPassword)) {
            return;
        }

        // Check if admin user already exists
        if (userRepository.existsByRole(Role.ADMIN)) {
            return;
        }

        String normalizedEmail = adminEmail.trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalStateException("Configured bootstrap admin email belongs to a non-admin account");
        }

        // Get or create ADMIN role
        RoleEntity adminRole = roleRepository != null
                ? roleRepository.findByName(Role.ADMIN).orElse(RoleEntity.of(Role.ADMIN))
                : RoleEntity.of(Role.ADMIN);

        try {
            Set<RoleEntity> roles = new HashSet<>();
            roles.add(adminRole);

            User admin = User.builder()
                    .name("System Administrator")
                    .email(normalizedEmail)
                    .phone("+94000000000")
                    .password(passwordEncoder.encode(adminPassword))
                    .roles(roles)
                    .status(AccountStatus.ACTIVE)
                    .build();

            userRepository.save(admin);
        } catch (DataIntegrityViolationException ex) {
            // Check again if admin was created by another thread
            boolean adminExistsNow = userRepository.findAll().stream()
                    .anyMatch(user -> user.hasRole(Role.ADMIN));
            if (!adminExistsNow) {
                throw ex;
            }
        }
    }
}
