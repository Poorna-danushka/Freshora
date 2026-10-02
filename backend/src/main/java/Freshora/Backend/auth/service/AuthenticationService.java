package Freshora.Backend.auth.service;

import Freshora.Backend.auth.dto.*;
import Freshora.Backend.auth.entity.AuthToken;
import Freshora.Backend.auth.entity.AuthTokenType;
import Freshora.Backend.auth.repository.AuthTokenRepository;
import Freshora.Backend.auth.security.JwtService;
import Freshora.Backend.config.CookieProperties;
import Freshora.Backend.config.CookieSupport;
import Freshora.Backend.exception.AuthenticationException;
import Freshora.Backend.user.entity.User;
import Freshora.Backend.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Locale;
import java.util.UUID;

/**
 * Service for core authentication operations
 * Handles universal login for all user types, token refresh, logout, password management
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService {

    private final UserRepository userRepository;
    private final AuthTokenRepository authTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TokenService tokenService;
    private final CookieSupport cookieSupport;
    private final CookieProperties cookieProperties;
    private final EmailService emailService;

    /**
     * Universal login - works for all user types
     * Validates credentials and account status
     * Issues authentication tokens
     */
    @Transactional
    public AuthResponse login(LoginRequest request, HttpServletResponse response) {
        String normalizedEmail = normalizeEmail(request.email());

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        // Check account status
        if (!user.isEnabled()) {
            String message = switch (user.getStatus()) {
                case PENDING -> "Your account is pending approval. We'll notify you once it's activated.";
                case SUSPENDED -> "Your account has been suspended. Please contact support.";
                default -> "Your account is not active. Please contact support.";
            };
            throw new AuthenticationException(message);
        }

        // Check if user has any roles
        if (user.getRoles().isEmpty()) {
            throw new AuthenticationException("Your account is not properly configured. Please contact support.");
        }

        log.info("User logged in successfully: {}", user.getEmail());

        // Revoke existing refresh tokens and issue new ones
        tokenService.revokeUserTokens(user);
        return tokenService.issueAuthenticationTokens(user, response, "Login successful");
    }

    /**
     * Logout - revokes refresh tokens and clears cookies
     */
    @Transactional
    public MessageResponse logout(HttpServletRequest request, HttpServletResponse response) {
        String refreshTokenValue = extractCookieValue(request, cookieProperties.getRefreshCookieName());

        // Clear cookies
        cookieSupport.clearCookie(response, cookieProperties.getAccessCookieName(), "/");
        cookieSupport.clearCookie(response, cookieProperties.getRefreshCookieName(), "/api/auth");

        // Revoke refresh token if valid
        if (refreshTokenValue != null && jwtService.isTokenValid(refreshTokenValue, "refresh")) {
            String tokenId = jwtService.extractJti(refreshTokenValue);
            authTokenRepository.findByTokenHashAndType(tokenId, AuthTokenType.REFRESH)
                    .ifPresent(token -> {
                        token.setRevokedAt(Instant.now());
                        authTokenRepository.save(token);
                    });
        }

        return new MessageResponse("Logout successful");
    }

    /**
     * Refresh access token using refresh token
     */
    @Transactional
    public MessageResponse refresh(HttpServletRequest request, HttpServletResponse response) {
        String refreshTokenValue = extractCookieValue(request, cookieProperties.getRefreshCookieName());

        if (refreshTokenValue == null || refreshTokenValue.isBlank()) {
            throw new AuthenticationException("Refresh token is missing");
        }

        if (!jwtService.isTokenValid(refreshTokenValue, "refresh")) {
            throw new AuthenticationException("Refresh token is invalid");
        }

        String tokenId = jwtService.extractJti(refreshTokenValue);
        AuthToken storedToken = authTokenRepository.findByTokenHashAndType(tokenId, AuthTokenType.REFRESH)
                .orElseThrow(() -> new AuthenticationException("Refresh token not found"));

        if (storedToken.isRevoked() || storedToken.isExpired()) {
            throw new AuthenticationException("Refresh token has been revoked or expired");
        }

        User user = storedToken.getUser();
        if (!user.isEnabled()) {
            throw new AuthenticationException("User account is not active");
        }

        // Revoke old token
        storedToken.setRevokedAt(Instant.now());
        authTokenRepository.save(storedToken);

        // Issue new tokens
        tokenService.issueAuthenticationTokens(user, response);

        return new MessageResponse("Token refreshed successfully");
    }

    /**
     * Request password reset - sends email with reset token
     */
    @Transactional
    public MessageResponse requestPasswordReset(String email) {
        String normalizedEmail = normalizeEmail(email);

        java.util.Optional<User> optionalUser = userRepository.findByEmail(normalizedEmail);
        if (optionalUser.isEmpty()) {
            return new MessageResponse("If an account exists for this email, a reset link was sent");
        }
        User user = optionalUser.get();

        // Generate reset token
        String rawToken = UUID.randomUUID().toString();
        String tokenHash = passwordEncoder.encode(rawToken);

        // Delete any existing reset tokens for user
        authTokenRepository.deleteByUserAndType(user, AuthTokenType.RESET);

        AuthToken resetToken = AuthToken.builder()
                .user(user)
                .tokenHash(tokenHash)
                .type(AuthTokenType.RESET)
                .expiresAt(Instant.now().plus(1, ChronoUnit.HOURS))
                .build();

        authTokenRepository.save(resetToken);

        emailService.sendPasswordResetEmail(user.getEmail(), rawToken);
        log.info("Password reset requested for: {}", user.getEmail());

        return new MessageResponse("If an account exists for this email, a reset link was sent");
    }

    /**
     * Reset password using reset token
     */
    @Transactional
    public MessageResponse resetPassword(String rawToken, String newPassword) {
        AuthToken resetToken = findMatchingPasswordResetToken(rawToken);

        if (resetToken.isExpired()) {
            throw new AuthenticationException("Password reset token has expired");
        }

        if (resetToken.isRevoked()) {
            throw new AuthenticationException("Password reset token has already been used");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        tokenService.revokeUserTokens(user);

        resetToken.setRevokedAt(Instant.now());
        authTokenRepository.save(resetToken);

        log.info("Password reset successfully for: {}", user.getEmail());

        return new MessageResponse("Password reset successful");
    }

    /**
     * Change password for authenticated user
     */
    @Transactional
    public MessageResponse changePassword(User user, String currentPassword, String newPassword) {
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BadCredentialsException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Revoke all refresh tokens to force re-login
        tokenService.revokeUserTokens(user);

        log.info("Password changed for: {}", user.getEmail());

        return new MessageResponse("Password changed successfully. Please log in again.");
    }

    /**
     * Find matching password reset token
     */
    private AuthToken findMatchingPasswordResetToken(String rawToken) {
        return authTokenRepository.findAll().stream()
                .filter(token -> token.getType() == AuthTokenType.RESET && !token.isExpired() && !token.isRevoked())
                .filter(token -> passwordEncoder.matches(rawToken, token.getTokenHash()))
                .findFirst()
                .orElseThrow(() -> new AuthenticationException("Invalid or expired reset token"));
    }

    /**
     * Extract cookie value from request
     */
    private String extractCookieValue(HttpServletRequest request, String cookieName) {
        if (request.getCookies() == null) return null;

        return java.util.Arrays.stream(request.getCookies())
                .filter(cookie -> cookie.getName().equals(cookieName))
                .findFirst()
                .map(cookie -> cookie.getValue())
                .orElse(null);
    }

    /**
     * Normalize email to lowercase and trim
     */
    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }
}
