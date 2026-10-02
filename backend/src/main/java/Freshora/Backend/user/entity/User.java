package Freshora.Backend.user.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Instant;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Entity
@Table(name = "users",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_users_email", columnNames = "email"),
        @UniqueConstraint(name = "uk_users_phone", columnNames = "phone")
    }
)
@Getter
@Setter
@AllArgsConstructor
@Builder
public class User implements UserDetails {

    public User() {
        this.status = AccountStatus.PENDING;
        this.roles = new HashSet<>();
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "password_hash", nullable = false)
    private String password;

    @Column(name = "profile_image_url", length = 500)
    private String profileImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AccountStatus status;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<RoleEntity> roles;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    // Helper methods for roles
    public void addRole(RoleEntity role) {
        if (role != null) {
            if (role.getId() == null && role.getName() != null) {
                role.setId(role.getName().getId());
            }
            this.roles.add(role);
        }
    }

    public void removeRole(RoleEntity role) {
        this.roles.remove(role);
    }

    public boolean hasRole(Role role) {
        return this.roles.stream()
                .anyMatch(r -> r.getName() == role);
    }

    public Set<Role> getRoleNames() {
        return this.roles.stream()
                .map(r -> r.getName())
                .collect(Collectors.toSet());
    }

    // For backward compatibility - get primary role
    public Role getPrimaryRole() {
        if (roles == null || roles.isEmpty()) {
            return Role.CUSTOMER;
        }
        if (hasRole(Role.ADMIN)) return Role.ADMIN;
        if (hasRole(Role.STORE_MANAGER)) return Role.STORE_MANAGER;
        if (hasRole(Role.DRIVER)) return Role.DRIVER;
        if (hasRole(Role.STORE_STAFF)) return Role.STORE_STAFF;
        return Role.CUSTOMER;
    }

    public Role getRole() {
        return getPrimaryRole();
    }

    public void setRole(Role role) {
        if (role != null) {
            this.roles.clear();
            this.roles.add(RoleEntity.of(role));
        }
    }

    public String getFirstName() {
        if (name == null) return "";
        int idx = name.indexOf(' ');
        return idx >= 0 ? name.substring(0, idx) : name;
    }

    public String getLastName() {
        if (name == null) return "";
        int idx = name.indexOf(' ');
        return idx >= 0 ? name.substring(idx + 1) : "";
    }

    public void setFirstName(String firstName) {
        String last = getLastName();
        String first = firstName == null ? "" : firstName.trim();
        this.name = (first + " " + last).trim();
    }

    public void setLastName(String lastName) {
        String first = getFirstName();
        String last = lastName == null ? "" : lastName.trim();
        this.name = (first + " " + last).trim();
    }

    public void setEnabled(boolean enabled) {
        this.status = enabled ? AccountStatus.ACTIVE : AccountStatus.SUSPENDED;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName().name()))
                .collect(Collectors.toSet());
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return status != AccountStatus.SUSPENDED;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return status == AccountStatus.ACTIVE;
    }

    public static class UserBuilder {
        private String firstName;
        private String lastName;
        private Set<RoleEntity> roles = new HashSet<>();
        private AccountStatus status = AccountStatus.PENDING;

        public UserBuilder firstName(String firstName) {
            this.firstName = firstName;
            syncName();
            return this;
        }

        public UserBuilder lastName(String lastName) {
            this.lastName = lastName;
            syncName();
            return this;
        }

        private void syncName() {
            String f = this.firstName != null ? this.firstName.trim() : "";
            String l = this.lastName != null ? this.lastName.trim() : "";
            String combined = (f + " " + l).trim();
            if (!combined.isEmpty()) {
                this.name = combined;
            }
        }

        public UserBuilder role(Role role) {
            if (role != null) {
                if (this.roles == null) {
                    this.roles = new HashSet<>();
                }
                this.roles.add(RoleEntity.of(role));
            }
            return this;
        }

        public UserBuilder roles(Set<RoleEntity> roles) {
            this.roles = new HashSet<>();
            if (roles != null) {
                for (RoleEntity r : roles) {
                    if (r != null) {
                        if (r.getId() == null && r.getName() != null) {
                            r.setId(r.getName().getId());
                        }
                        this.roles.add(r);
                    }
                }
            }
            return this;
        }

        public UserBuilder status(AccountStatus status) {
            this.status = status;
            return this;
        }

        public UserBuilder enabled(boolean enabled) {
            this.status = enabled ? AccountStatus.ACTIVE : AccountStatus.SUSPENDED;
            return this;
        }
    }
}
