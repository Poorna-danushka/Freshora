package Freshora.Backend.admin.controller;

import Freshora.Backend.admin.dto.CreateStaffAccountRequest;
import Freshora.Backend.auth.dto.UserResponse;
import Freshora.Backend.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AuthService authService;

    @PostMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse createStaffAccount(@Valid @RequestBody CreateStaffAccountRequest request) {
        return authService.createStaffAccount(request);
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> getUsers() {
        return List.of();
    }
}
