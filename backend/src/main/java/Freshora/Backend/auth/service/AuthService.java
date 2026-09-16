package Freshora.Backend.auth.service;

import Freshora.Backend.auth.dto.AuthResponse;
import Freshora.Backend.auth.dto.LoginRequest;
import Freshora.Backend.auth.dto.MessageResponse;
import Freshora.Backend.auth.dto.RegisterRequest;
import Freshora.Backend.auth.dto.UserResponse;
import Freshora.Backend.auth.entity.RefreshToken;
import Freshora.Backend.auth.repository.RefreshTokenRepository;
import Freshora.Backend.auth.security.JwtService;
import Freshora.Backend.config.CookieProperties;
import Freshora.Backend.config.CookieSupport;
import Freshora.Backend.exception.AuthenticationException;
import Freshora.Backend.exception.ConflictException;
import Freshora.Backend.exception.ResourceNotFoundException;
import Freshora.Backend.user.entity.Role;
import Freshora.Backend.user.entity.User;
import Freshora.Backend.user.repository.UserRepository;
import Freshora.Backend.admin.dto.CreateStaffAccountRequest;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Arrays;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final CookieSupport cookieSupport;
    private final CookieProperties cookieProperties;

    @Transactional
    public AuthResponse register(RegisterRequest request, HttpServletResponse response) {
        String normalizedEmail = normalizeEmail(request.email());
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ConflictException("Email already exists");
        }

        User user = User.builder()
                .firstName(request.firstName().trim())
                .lastName(request.lastName().trim())
                .email(normalizedEmail)
                .password(passwordEncoder.encode(request.password()))
                .role(Role.CUSTOMER)
                .enabled(true)
                .build();

        User savedUser = userRepository.save(user);

        // Issue tokens immediately so the user is logged in after registration
        String accessToken = jwtService.generateAccessToken(savedUser);
        String refreshToken = jwtService.generateRefreshToken(savedUser);
        String refreshJti = jwtService.extractJti(refreshToken);

        RefreshToken refreshTokenRecord = RefreshToken.builder()
                .user(savedUser)
                .tokenId(refreshJti)
                .expiresAt(Instant.now().plusMillis(jwtService.getRefreshExpirationMs()))
                .build();
        refreshTokenRepository.save(refreshTokenRecord);

        cookieSupport.addAccessTokenCookie(response, accessToken, jwtService.getAccessExpirationMs());
        cookieSupport.addRefreshTokenCookie(response, refreshToken, jwtService.getRefreshExpirationMs());

        return new AuthResponse("Registration successful", toUserResponse(savedUser));
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

        User user = User.builder()
                .firstName(request.firstName().trim())
                .lastName(request.lastName().trim())
                .email(normalizedEmail)
                .password(passwordEncoder.encode(request.password()))
                .role(request.role())
                .enabled(true)
                .build();

        return toUserResponse(userRepository.save(user));
    }

    @Transactional
    public AuthResponse login(LoginRequest request, HttpServletResponse response) {
        String normalizedEmail = normalizeEmail(request.email());
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        if (!user.isEnabled()) {
            throw new AuthenticationException("Account is disabled");
        }

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        String refreshJti = jwtService.extractJti(refreshToken);

        refreshTokenRepository.deleteByUser(user);
        RefreshToken refreshTokenRecord = RefreshToken.builder()
                .user(user)
                .tokenId(refreshJti)
                .expiresAt(Instant.now().plusMillis(jwtService.getRefreshExpirationMs()))
                .build();
        refreshTokenRepository.save(refreshTokenRecord);

        cookieSupport.addAccessTokenCookie(response, accessToken, jwtService.getAccessExpirationMs());
        cookieSupport.addRefreshTokenCookie(response, refreshToken, jwtService.getRefreshExpirationMs());

        return new AuthResponse("Login successful", toUserResponse(user));
    }

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
        RefreshToken storedToken = refreshTokenRepository.findByTokenId(tokenId)
                .orElseThrow(() -> new AuthenticationException("Refresh token not found"));

        if (storedToken.isRevoked() || storedToken.isExpired()) {
            throw new AuthenticationException("Refresh token has been revoked or expired");
        }

        User user = storedToken.getUser();
        if (!user.isEnabled()) {
            throw new AuthenticationException("User account is disabled");
        }

        storedToken.setRevokedAt(Instant.now());
        refreshTokenRepository.save(storedToken);

        String newAccessToken = jwtService.generateAccessToken(user);
        String newRefreshToken = jwtService.generateRefreshToken(user);
        String newRefreshJti = jwtService.extractJti(newRefreshToken);

        RefreshToken newStoredToken = RefreshToken.builder()
                .user(user)
                .tokenId(newRefreshJti)
                .expiresAt(Instant.now().plusMillis(jwtService.getRefreshExpirationMs()))
                .build();
        refreshTokenRepository.save(newStoredToken);

        cookieSupport.addAccessTokenCookie(response, newAccessToken, jwtService.getAccessExpirationMs());
        cookieSupport.addRefreshTokenCookie(response, newRefreshToken, jwtService.getRefreshExpirationMs());

        return new MessageResponse("Token refreshed");
    }

    @Transactional
    public MessageResponse logout(HttpServletRequest request, HttpServletResponse response) {
        String refreshTokenValue = extractCookieValue(request, cookieProperties.getRefreshCookieName());
        if (refreshTokenValue != null && !refreshTokenValue.isBlank()) {
            try {
                String tokenId = jwtService.extractJti(refreshTokenValue);
                refreshTokenRepository.findByTokenId(tokenId).ifPresent(token -> {
                    token.setRevokedAt(Instant.now());
                    refreshTokenRepository.save(token);
                });
            } catch (Exception ignored) {
                // Ignore malformed refresh tokens and still clear cookies.
            }
        }

        cookieSupport.clearCookie(response, cookieProperties.getAccessCookieName(), "/");
        cookieSupport.clearCookie(response, cookieProperties.getRefreshCookieName(), "/api/auth");
        return new MessageResponse("Logout successful");
    }

    public UserResponse me(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toUserResponse(user);
    }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(user.getId(), user.getFirstName(), user.getLastName(), user.getEmail(), user.getRole());
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    private String extractCookieValue(HttpServletRequest request, String cookieName) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }

        return Arrays.stream(cookies)
                .filter(cookie -> cookieName.equals(cookie.getName()))
                .map(cookie -> cookie.getValue())
                .findFirst()
                .orElse(null);
    }
}
