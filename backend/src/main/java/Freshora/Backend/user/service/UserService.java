package Freshora.Backend.user.service;

import Freshora.Backend.auth.dto.DashboardRouteResponse;
import Freshora.Backend.auth.dto.UserResponse;
import Freshora.Backend.exception.ResourceNotFoundException;
import Freshora.Backend.user.entity.Role;
import Freshora.Backend.user.entity.RoleEntity;
import Freshora.Backend.user.entity.User;
import Freshora.Backend.user.repository.RoleRepository;
import Freshora.Backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public User findById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public UserResponse getUserResponseByEmail(String email) {
        User user = findByEmail(email);
        return toUserResponse(user);
    }

    public UserResponse getUserResponseById(UUID id) {
        User user = findById(id);
        return toUserResponse(user);
    }

    @Transactional
    public void addRoleToUser(UUID userId, Role role) {
        User user = findById(userId);
        RoleEntity roleEntity = roleRepository.findByName(role)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + role));
        user.addRole(roleEntity);
        userRepository.save(user);
    }

    @Transactional
    public void removeRoleFromUser(UUID userId, Role role) {
        User user = findById(userId);
        RoleEntity roleEntity = roleRepository.findByName(role)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + role));
        user.removeRole(roleEntity);
        userRepository.save(user);
    }

    public java.util.List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toUserResponse)
                .toList();
    }

    private UserResponse toUserResponse(User user) {
        Set<Role> roles = user.getRoleNames();
        DashboardRouteResponse dashboard = DashboardRouteResponse.from(roles);

        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getProfileImageUrl(),
                user.getStatus().name(),
                roles.stream().map(r -> r.name()).collect(Collectors.toSet()),
                dashboard.primaryDashboard(),
                dashboard.availableDashboards()
        );
    }
}
