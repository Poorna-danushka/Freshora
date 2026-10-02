package Freshora.Backend.auth.controller;

import Freshora.Backend.auth.dto.AccountSetupRequest;
import Freshora.Backend.auth.dto.AuthResponse;
import Freshora.Backend.auth.dto.ChangePasswordRequest;
import Freshora.Backend.auth.dto.DashboardRouteResponse;
import Freshora.Backend.auth.dto.ForgotPasswordRequest;
import Freshora.Backend.auth.dto.LoginRequest;
import Freshora.Backend.auth.dto.MessageResponse;
import Freshora.Backend.auth.dto.RegisterRequest;
import Freshora.Backend.auth.dto.ResetPasswordRequest;
import Freshora.Backend.auth.dto.UserResponse;
import Freshora.Backend.auth.service.AuthService;
import Freshora.Backend.user.entity.User;
import Freshora.Backend.user.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request, HttpServletResponse response) {
        return authService.register(request, response);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        return authService.login(request, response);
    }

    @PostMapping("/logout")
    public MessageResponse logout(HttpServletRequest request, HttpServletResponse response) {
        return authService.logout(request, response);
    }

    @PostMapping("/refresh")
    public MessageResponse refresh(HttpServletRequest request, HttpServletResponse response) {
        return authService.refresh(request, response);
    }

    @PostMapping("/forgot-password")
    public MessageResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return authService.requestPasswordReset(request.email());
    }

    @PostMapping("/reset-password")
    public MessageResponse resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return authService.resetPassword(request.token(), request.password());
    }

    @PostMapping("/setup-account")
    public MessageResponse setupAccount(@Valid @RequestBody AccountSetupRequest request) {
        return authService.setupAccount(request.token(), request.password());
    }

    @PostMapping("/change-password")
    public MessageResponse changePassword(Authentication authentication, @Valid @RequestBody ChangePasswordRequest request) {
        User currentUser = userService.findByEmail(authentication.getName());
        return authService.changePassword(currentUser, request.currentPassword(), request.newPassword());
    }

    @GetMapping("/me")
    public UserResponse getCurrentUser(Authentication authentication) {
        return userService.getUserResponseByEmail(authentication.getName());
    }

    @GetMapping("/dashboard")
    public DashboardRouteResponse getDashboardRoute(Authentication authentication) {
        User user = userService.findByEmail(authentication.getName());
        return DashboardRouteResponse.from(user.getRoleNames());
    }

    @GetMapping("/csrf")
    public MessageResponse csrf(CsrfToken token) {
        token.getToken();
        return new MessageResponse("CSRF token initialized");
    }
}
