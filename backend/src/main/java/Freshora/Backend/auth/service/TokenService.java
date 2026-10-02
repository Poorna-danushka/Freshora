package Freshora.Backend.auth.service;

import Freshora.Backend.auth.dto.AuthResponse;
import Freshora.Backend.auth.dto.DashboardRouteResponse;
import Freshora.Backend.auth.dto.UserResponse;
import Freshora.Backend.auth.entity.AuthToken;
import Freshora.Backend.auth.entity.AuthTokenType;
import Freshora.Backend.auth.repository.AuthTokenRepository;
import Freshora.Backend.auth.security.JwtService;
import Freshora.Backend.config.CookieSupport;
import Freshora.Backend.user.entity.Role;
import Freshora.Backend.user.entity.User;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service for managing authentication tokens (access and refresh tokens)
 */
@Service
@RequiredArgsConstructor
public class TokenService {

    private final JwtService jwtService;
    private final AuthTokenRepository authTokenRepository;
    private final CookieSupport cookieSupport;

    /**
     * Issue authentication tokens for a user and set them as HTTP-only cookies
     * Returns AuthResponse with user details and dashboard routing info
     */
    @Transactional
    public AuthResponse issueAuthenticationTokens(User user, HttpServletResponse response) {
        return issueAuthenticationTokens(user, response, "Authentication successful");
    }

    @Transactional
    public AuthResponse issueAuthenticationTokens(User user, HttpServletResponse response, String message) {
        // Generate JWT tokens
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        String refreshJti = jwtService.extractJti(refreshToken);

        // Store refresh token in database (using AUTH_TOKENS table)
        AuthToken refreshTokenRecord = AuthToken.builder()
                .user(user)
                .tokenHash(refreshJti)
                .type(AuthTokenType.REFRESH)
                .expiresAt(Instant.now().plusMillis(jwtService.getRefreshExpirationMs()))
                .build();
        authTokenRepository.save(refreshTokenRecord);

        // Set tokens as HTTP-only cookies
        cookieSupport.addAccessTokenCookie(response, accessToken, jwtService.getAccessExpirationMs());
        cookieSupport.addRefreshTokenCookie(response, refreshToken, jwtService.getRefreshExpirationMs());

        return new AuthResponse(message != null ? message : "Authentication successful", toUserResponse(user));
    }

    /**
     * Revoke all refresh tokens for a user
     */
    @Transactional
    public void revokeUserTokens(User user) {
        authTokenRepository.deleteByUserAndType(user, AuthTokenType.REFRESH);
    }

    /**
     * Convert User entity to UserResponse DTO
     */
    public UserResponse toUserResponse(User user) {
        Set<Role> roles = user.getRoleNames();
        DashboardRouteResponse dashboard = DashboardRouteResponse.from(roles);

        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getProfileImageUrl(),
                user.getStatus().name(),
                roles.stream().map(role -> role.name()).collect(Collectors.toSet()),
                dashboard.primaryDashboard(),
                dashboard.availableDashboards()
        );
    }
}
