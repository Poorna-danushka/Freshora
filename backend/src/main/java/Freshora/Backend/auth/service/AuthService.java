package Freshora.Backend.auth.service;

import Freshora.Backend.admin.dto.CreateStaffAccountRequest;
import Freshora.Backend.auth.dto.AuthResponse;
import Freshora.Backend.auth.dto.LoginRequest;
import Freshora.Backend.auth.dto.MessageResponse;
import Freshora.Backend.auth.dto.RegisterRequest;
import Freshora.Backend.auth.dto.UserResponse;
import Freshora.Backend.auth.entity.AuthToken;
import Freshora.Backend.auth.entity.AuthTokenType;
import Freshora.Backend.auth.repository.AuthTokenRepository;
import Freshora.Backend.exception.AuthenticationException;
import Freshora.Backend.exception.ConflictException;
import Freshora.Backend.user.entity.AccountStatus;
import Freshora.Backend.user.entity.Role;
import Freshora.Backend.user.entity.RoleEntity;
import Freshora.Backend.user.entity.User;
import Freshora.Backend.user.repository.RoleRepository;
import Freshora.Backend.user.repository.UserRepository;
import Freshora.Backend.user.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AuthTokenRepository authTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationService authenticationService;
    private final TokenService tokenService;
    private final UserService userService;
    private final EmailService emailService;

    @Transactional
    public AuthResponse register(RegisterRequest request, HttpServletResponse response) {
        String normalizedEmail = normalizeEmail(request.email());
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ConflictException("Email already exists");
        }

        RoleEntity customerRole = roleRepository != null
                ? roleRepository.findByName(Role.CUSTOMER).orElse(RoleEntity.of(Role.CUSTOMER))
                : RoleEntity.of(Role.CUSTOMER);
        Set<RoleEntity> roles = new HashSet<>();
        roles.add(customerRole);

        User user = User.builder()
                .firstName(request.firstName().trim())
                .lastName(request.lastName().trim())
                .email(normalizedEmail)
                .phone("+94" + UUID.randomUUID().toString().replaceAll("[^0-9]", "").substring(0, 9))
                .password(passwordEncoder.encode(request.password()))
                .roles(roles)
                .status(AccountStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);

        return tokenService.issueAuthenticationTokens(savedUser, response, "Registration successful");
    }

    @Transactional
    public AuthResponse login(LoginRequest request, HttpServletResponse response) {
        return authenticationService.login(request, response);
    }

    @Transactional
    public MessageResponse logout(HttpServletRequest request, HttpServletResponse response) {
        return authenticationService.logout(request, response);
    }

    @Transactional
    public MessageResponse refresh(HttpServletRequest request, HttpServletResponse response) {
        return authenticationService.refresh(request, response);
    }

    @Transactional
    public MessageResponse requestPasswordReset(String email) {
        return authenticationService.requestPasswordReset(email);
    }

    @Transactional
    public MessageResponse resetPassword(String token, String newPassword) {
        return authenticationService.resetPassword(token, newPassword);
    }

    @Transactional
    public MessageResponse changePassword(User currentUser, String currentPassword, String newPassword) {
        return authenticationService.changePassword(currentUser, currentPassword, newPassword);
    }

    @Transactional
    public UserResponse createStaffAccount(CreateStaffAccountRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ConflictException("Email already exists");
        }
        if (request.role() == Role.CUSTOMER) {
            throw new ConflictException("Customer accounts must use public signup");
        }

        RoleEntity staffRole = roleRepository != null
                ? roleRepository.findByName(request.role()).orElse(RoleEntity.of(request.role()))
                : RoleEntity.of(request.role());
        Set<RoleEntity> roles = new HashSet<>();
        roles.add(staffRole);

        User user = User.builder()
                .firstName(request.firstName().trim())
                .lastName(request.lastName().trim())
                .email(normalizedEmail)
                .phone("+94" + UUID.randomUUID().toString().replaceAll("[^0-9]", "").substring(0, 9))
                .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                .roles(roles)
                .status(AccountStatus.PENDING)
                .build();

        User savedUser = userRepository.save(user);
        String token = createAccountSetupToken(savedUser);
        emailService.sendAccountSetupEmail(savedUser.getEmail(), token);

        return userService.getUserResponseById(savedUser.getId());
    }

    @Transactional
    public MessageResponse setupAccount(String token, String password) {
        String rawToken = token == null ? null : token.trim();
        if (rawToken == null || rawToken.isBlank()) {
            throw new IllegalArgumentException("Setup token is required");
        }
        if (password == null || password.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters");
        }

        AuthToken matchingToken = findMatchingAccountSetupToken(rawToken);
        User user = matchingToken.getUser();

        if (user.getStatus() == AccountStatus.ACTIVE && user.isEnabled()) {
            throw new ConflictException("Account setup has already been completed");
        }

        user.setPassword(passwordEncoder.encode(password));
        user.setStatus(AccountStatus.ACTIVE);
        userRepository.save(user);

        matchingToken.setRevokedAt(Instant.now());
        authTokenRepository.save(matchingToken);
        authTokenRepository.deleteByUserAndType(user, AuthTokenType.VERIFY);

        return new MessageResponse("Account setup complete");
    }

    @Transactional
    public String createPasswordResetToken(User user) {
        String rawToken = UUID.randomUUID().toString().replace("-", "");
        authTokenRepository.deleteByUserAndType(user, AuthTokenType.RESET);
        authTokenRepository.save(AuthToken.builder()
                .user(user)
                .tokenHash(passwordEncoder.encode(rawToken))
                .type(AuthTokenType.RESET)
                .expiresAt(Instant.now().plus(1, ChronoUnit.HOURS))
                .build());
        return rawToken;
    }

    @Transactional
    public String createAccountSetupToken(User user) {
        String rawToken = UUID.randomUUID().toString().replace("-", "");
        authTokenRepository.deleteByUserAndType(user, AuthTokenType.VERIFY);
        authTokenRepository.save(AuthToken.builder()
                .user(user)
                .tokenHash(passwordEncoder.encode(rawToken))
                .type(AuthTokenType.VERIFY)
                .expiresAt(Instant.now().plus(7, ChronoUnit.DAYS))
                .build());
        return rawToken;
    }

    public UserResponse me(String email) {
        return userService.getUserResponseByEmail(email);
    }

    private AuthToken findMatchingAccountSetupToken(String rawToken) {
        for (AuthToken candidate : authTokenRepository.findAll()) {
            if (candidate.getType() == AuthTokenType.VERIFY && !candidate.isExpired() && !candidate.isRevoked()) {
                if (passwordEncoder.matches(rawToken, candidate.getTokenHash())) {
                    return candidate;
                }
            }
        }
        throw new AuthenticationException("Account setup token is invalid or expired");
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }
}
