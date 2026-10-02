package Freshora.Backend;

import Freshora.Backend.auth.dto.DashboardRouteResponse;
import Freshora.Backend.auth.dto.ForgotPasswordRequest;
import Freshora.Backend.auth.dto.LoginRequest;
import Freshora.Backend.auth.dto.RegisterRequest;
import Freshora.Backend.auth.dto.UserResponse;
import Freshora.Backend.auth.entity.AuthToken;
import Freshora.Backend.auth.entity.AuthTokenType;
import Freshora.Backend.auth.repository.AuthTokenRepository;
import Freshora.Backend.auth.service.AuthService;
import Freshora.Backend.user.entity.AccountStatus;
import Freshora.Backend.user.entity.Role;
import Freshora.Backend.user.entity.User;
import Freshora.Backend.user.repository.UserRepository;
import Freshora.Backend.user.service.UserService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpMethod;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMultipartHttpServletRequestBuilder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import tools.jackson.databind.JsonNode;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
class BackendApplicationTests {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = JsonMapper.builder().build();

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
        userRepository.findByEmail("admin@freshora.test").orElseGet(() -> userRepository.save(User.builder()
                .firstName("Demo")
                .lastName("Admin")
                .email("admin@freshora.test")
                .password(passwordEncoder.encode("FreshoraAdmin123!"))
                .role(Role.ADMIN)
                .enabled(true)
                .status(AccountStatus.ACTIVE)
                .build()));
    }

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private UserService userService;

    @Autowired
    private AuthTokenRepository authTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ──────────────────────────────────────────────────────────
    // EXISTING AUTH TESTS (unchanged)
    // ──────────────────────────────────────────────────────────

    @Test
    void registerUser_shouldCreateUser() throws Exception {
        RegisterRequest request = new RegisterRequest("Jane", "Doe", "jane@example.com", "StrongPassword123!");

        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Registration successful"))
                .andExpect(jsonPath("$.user.email").value("jane@example.com"));

        assertThat(userRepository.existsByEmail("jane@example.com")).isTrue();
    }

    @Test
    void duplicateEmail_shouldReturnConflict() throws Exception {
        RegisterRequest request = new RegisterRequest("John", "Smith", "duplicate@example.com", "StrongPassword123!");

        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Email already exists"));
    }

    @Test
    void login_shouldSetAuthenticationCookies() throws Exception {
        registerUser("login@test.com", "StrongPassword123!");

        LoginRequest loginRequest = new LoginRequest("login@test.com", "StrongPassword123!");

        var loginResult = mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("FRESHORA_ACCESS_TOKEN"))
                .andExpect(cookie().exists("FRESHORA_REFRESH_TOKEN"))
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andReturn();

        assertThat(loginResult.getResponse().getCookie("FRESHORA_ACCESS_TOKEN").isHttpOnly()).isTrue();
        assertThat(loginResult.getResponse().getCookie("FRESHORA_REFRESH_TOKEN").isHttpOnly()).isTrue();
    }

    @Test
    void login_shouldReturnAdminRoleAndMatchingDashboard() throws Exception {
        User user = userRepository.save(User.builder()
                .firstName("Route")
                .lastName("Admin")
                .email("role-routing-admin@test.com")
                .password(passwordEncoder.encode("StrongPassword123!"))
                .role(Role.ADMIN)
                .enabled(true)
                .status(AccountStatus.ACTIVE)
                .build());
        UserResponse userResponse = userService.getUserResponseById(user.getId());
        assertThat(userResponse.roles()).containsExactly(Role.ADMIN.name());
        assertThat(userResponse.role()).isEqualTo(Role.ADMIN);

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new LoginRequest("role-routing-admin@test.com", "StrongPassword123!"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.name").value("Route Admin"))
                .andExpect(jsonPath("$.user.status").value("ACTIVE"))
                .andExpect(jsonPath("$.user.role").value("ADMIN"))
                .andExpect(jsonPath("$.user.roles[0]").value("ADMIN"))
                .andExpect(jsonPath("$.user.primaryDashboard").value("/admin-dashboard"));
    }

    @Test
    void dashboardRoutes_shouldMatchFrontendRoutesAndRolePriority() {
        assertThat(DashboardRouteResponse.from(Set.of(Role.ADMIN)).primaryDashboard()).isEqualTo("/admin-dashboard");
        assertThat(DashboardRouteResponse.from(Set.of(Role.STORE_MANAGER)).primaryDashboard())
                .isEqualTo("/store-manager-dashboard");
        assertThat(DashboardRouteResponse.from(Set.of(Role.DRIVER)).primaryDashboard()).isEqualTo("/driver-dashboard");
        assertThat(DashboardRouteResponse.from(Set.of(Role.STORE_STAFF)).primaryDashboard())
                .isEqualTo("/store-staff-dashboard");
        assertThat(DashboardRouteResponse.from(Set.of(Role.CUSTOMER)).primaryDashboard()).isEqualTo("/user-dashboard");
        assertThat(DashboardRouteResponse.from(Set.of(Role.CUSTOMER, Role.ADMIN)).primaryDashboard())
                .isEqualTo("/admin-dashboard");

        UserResponse userResponse = new UserResponse(
                UUID.randomUUID(),
                "Admin User",
                "admin@test.com",
                null,
                null,
                "ACTIVE",
                Role.ADMIN,
                Set.of(Role.CUSTOMER.name(), Role.ADMIN.name()),
                "/admin-dashboard",
                Set.of("/user-dashboard", "/admin-dashboard")
        );
        assertThat(userResponse.role()).isEqualTo(Role.ADMIN);
    }

    @Test
    void refreshEndpoint_shouldRequireCsrfToken() throws Exception {
        mockMvc.perform(post("/api/auth/refresh"))
                .andExpect(status().isForbidden());
    }

    @Test
    void login_withWrongPassword_shouldReturnUnauthorized() throws Exception {
        registerUser("bad-password@test.com", "StrongPassword123!");

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("bad-password@test.com", "WrongPassword123!"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    void malformedJson_shouldReturnBadRequest() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Malformed request body"));
    }

    @Test
    void forgotPassword_withInvalidEmail_shouldReturnBadRequest() throws Exception {
        mockMvc.perform(post("/api/auth/forgot-password")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ForgotPasswordRequest("abc"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"));
    }

    @Test
    void me_requiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void missingCsrf_shouldFailForStateChangingRequest() throws Exception {
        RegisterRequest request = new RegisterRequest("No", "Csrf", "nocsrf@example.com", "StrongPassword123!");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void user_shouldBeForbiddenOnAdminEndpoint() throws Exception {
        registerUser("adminblocked@example.com", "StrongPassword123!");

        String loginJson = objectMapper.writeValueAsString(new LoginRequest("adminblocked@example.com", "StrongPassword123!"));
        var loginResult = mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                .andExpect(status().isOk())
                .andReturn();

        Cookie[] cookies = loginResult.getResponse().getCookies();
        mockMvc.perform(get("/api/admin/users").cookie(cookies))
                .andExpect(status().isForbidden());
    }

    @Test
    void resetPassword_shouldAllowUserToSetNewPassword() {
        User user = userRepository.save(User.builder()
                .firstName("Reset")
                .lastName("User")
                .email("reset-password@test.com")
                .password("existing-hash")
                .role(Role.CUSTOMER)
                .enabled(true)
                .status(AccountStatus.ACTIVE)
                .build());

        String token = authService.createPasswordResetToken(user);
        authTokenRepository.save(AuthToken.builder()
                .user(user)
                .tokenHash("refresh-token-hash-" + UUID.randomUUID())
                .type(AuthTokenType.REFRESH)
                .expiresAt(Instant.now().plusSeconds(3600))
                .build());
        assertThat(authTokenRepository.findByUserAndType(user, AuthTokenType.REFRESH)).hasSize(1);

        assertThat(authService.resetPassword(token, "NewPassword123!").message()).isEqualTo("Password reset successful");
        assertThat(userRepository.findByEmail("reset-password@test.com").orElseThrow().getPassword()).isNotEqualTo("existing-hash");
        assertThat(authTokenRepository.findByUserAndType(user, AuthTokenType.REFRESH)).isEmpty();
    }

    @Test
    void setupAccount_shouldActivatePendingUser() {
        User user = userRepository.save(User.builder()
                .firstName("Setup")
                .lastName("User")
                .email("setup-account@test.com")
                .password("pending-hash")
                .role(Role.STORE_MANAGER)
                .enabled(false)
                .status(AccountStatus.PENDING)
                .build());

        String token = authService.createAccountSetupToken(user);
        assertThat(authService.setupAccount(token, "NewPassword123!").message()).isEqualTo("Account setup complete");
        User updated = userRepository.findByEmail("setup-account@test.com").orElseThrow();
        assertThat(updated.isEnabled()).isTrue();
        assertThat(updated.getStatus()).isEqualTo(AccountStatus.ACTIVE);
    }

    @Test
    void profile_shouldReturnAuthenticatedUserData() throws Exception {
        registerUser("profile@test.com", "StrongPassword123!");
        String loginJson = objectMapper.writeValueAsString(new LoginRequest("profile@test.com", "StrongPassword123!"));
        var loginResult = mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                .andExpect(status().isOk())
                .andReturn();

        Cookie[] cookies = loginResult.getResponse().getCookies();
        mockMvc.perform(get("/api/users/me").cookie(cookies))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("profile@test.com"))
                .andExpect(jsonPath("$.role").value("CUSTOMER"));
    }

    @Test
    void address_shouldBeCreatedAndOwned() throws Exception {
        registerUser("address-owner@test.com", "StrongPassword123!");
        String loginJson = objectMapper.writeValueAsString(new LoginRequest("address-owner@test.com", "StrongPassword123!"));
        var loginResult = mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                .andExpect(status().isOk())
                .andReturn();

        Cookie[] cookies = loginResult.getResponse().getCookies();
        String addressJson = """
            {
              "label": "Home",
              "recipientName": "Jane Doe",
              "phone": "+94112223344",
              "addressLine1": "12 Main Street",
              "city": "Colombo",
              "district": "Colombo",
              "postalCode": "00100",
              "isDefault": true
            }
            """;

        mockMvc.perform(post("/api/users/me/addresses")
                        .cookie(cookies)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(addressJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.label").value("Home"));

        mockMvc.perform(get("/api/users/me/addresses").cookie(cookies))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].label").value("Home"));
    }

    @Test
    void address_shouldRejectOwnershipMismatch() throws Exception {
        registerUser("owner-a@test.com", "StrongPassword123!");
        registerUser("owner-b@test.com", "StrongPassword123!");

        var ownerALogin = mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("owner-a@test.com", "StrongPassword123!"))))
                .andExpect(status().isOk())
                .andReturn();

        Cookie[] ownerACookies = ownerALogin.getResponse().getCookies();
        String addressJson = """
            {
              "label": "Work",
              "recipientName": "Owner A",
              "phone": "+94112223344",
              "addressLine1": "64 Park Road",
              "city": "Galle",
              "district": "Galle",
              "postalCode": "80000",
              "isDefault": true
            }
            """;

        var createdResponse = mockMvc.perform(post("/api/users/me/addresses")
                        .cookie(ownerACookies)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(addressJson))
                .andExpect(status().isCreated())
                .andReturn();

        String responseBody = createdResponse.getResponse().getContentAsString();
        JsonNode createdAddress = objectMapper.readTree(responseBody);
        String addressId = createdAddress.get("id").asString();

        var ownerBLogin = mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("owner-b@test.com", "StrongPassword123!"))))
                .andExpect(status().isOk())
                .andReturn();

        Cookie[] ownerBCookies = ownerBLogin.getResponse().getCookies();
        mockMvc.perform(delete("/api/users/me/addresses/{id}", addressId)
                        .cookie(ownerBCookies)
                        .with(csrf()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void admin_shouldListUsers() throws Exception {
        String loginJson = objectMapper.writeValueAsString(new LoginRequest("admin@freshora.test", "FreshoraAdmin123!"));
        var loginResult = mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                .andExpect(status().isOk())
                .andReturn();

        Cookie[] cookies = loginResult.getResponse().getCookies();
        mockMvc.perform(get("/api/admin/users").cookie(cookies))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").exists());
    }

    // ──────────────────────────────────────────────────────────
    // SECURITY TEST SUITE — AUTHENTICATION
    // ──────────────────────────────────────────────────────────

    @Test
    void login_withUnknownEmail_shouldReturnSameGenericError() throws Exception {
        // Must return the exact same error as a wrong password to prevent email enumeration
        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("does-not-exist@test.com", "AnyPassword123!"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    void login_withDisabledAccount_shouldBeRejected() throws Exception {
        // Create a user with enabled=false, status=DISABLED
        String email = "disabled-user@test.com";
        userRepository.save(User.builder()
                .firstName("Disabled")
                .lastName("User")
                .email(email)
                .password(passwordEncoder.encode("StrongPassword123!"))
                .role(Role.CUSTOMER)
                .enabled(false)
                .status(AccountStatus.DISABLED)
                .build());

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(email, "StrongPassword123!"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void login_withSuspendedAccount_shouldBeRejected() throws Exception {
        String email = "suspended-user@test.com";
        userRepository.save(User.builder()
                .firstName("Suspended")
                .lastName("User")
                .email(email)
                .password(passwordEncoder.encode("StrongPassword123!"))
                .role(Role.CUSTOMER)
                .enabled(false)
                .status(AccountStatus.SUSPENDED)
                .build());

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(email, "StrongPassword123!"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void login_withPendingAccount_shouldBeRejected() throws Exception {
        // PENDING accounts (enabled=false, status=PENDING) must not authenticate
        String email = "pending-user@test.com";
        userRepository.save(User.builder()
                .firstName("Pending")
                .lastName("User")
                .email(email)
                .password(passwordEncoder.encode("StrongPassword123!"))
                .role(Role.STORE_MANAGER)
                .enabled(false)
                .status(AccountStatus.PENDING)
                .build());

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(email, "StrongPassword123!"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void disabledAccount_cannotUseProtectedAPI_withValidJwt() throws Exception {
        // Register and activate an account, get JWT cookies, then disable the account
        // and verify the JWT cookies no longer grant access
        String email = "disable-after-jwt@test.com";
        registerUser(email, "StrongPassword123!");

        var loginResult = mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(email, "StrongPassword123!"))))
                .andExpect(status().isOk())
                .andReturn();
        Cookie[] cookies = loginResult.getResponse().getCookies();

        // Verify access works initially
        mockMvc.perform(get("/api/users/me").cookie(cookies))
                .andExpect(status().isOk());

        // Now disable the account
        User user = userRepository.findByEmail(email).orElseThrow();
        user.setEnabled(false);
        user.setStatus(AccountStatus.DISABLED);
        userRepository.save(user);

        // The JWT filter checks user.isEnabled() on every request — disabled account must be rejected
        mockMvc.perform(get("/api/users/me").cookie(cookies))
                .andExpect(status().isUnauthorized());
    }

    // ──────────────────────────────────────────────────────────
    // SECURITY TEST SUITE — ROLE AUTHORIZATION
    // ──────────────────────────────────────────────────────────

    @Test
    void customer_cannotAccessAdminStoreApplications() throws Exception {
        registerUser("customer-admin-check@test.com", "StrongPassword123!");
        Cookie[] cookies = loginAndGetCookies("customer-admin-check@test.com", "StrongPassword123!");

        mockMvc.perform(get("/api/admin/store-applications").cookie(cookies))
                .andExpect(status().isForbidden());
    }

    @Test
    void customer_cannotAccessAdminDriverApplications() throws Exception {
        registerUser("customer-driver-check@test.com", "StrongPassword123!");
        Cookie[] cookies = loginAndGetCookies("customer-driver-check@test.com", "StrongPassword123!");

        mockMvc.perform(get("/api/admin/driver-applications").cookie(cookies))
                .andExpect(status().isForbidden());
    }

    @Test
    void storeManager_cannotAccessAdminApplicationList() throws Exception {
        // Create a STORE_MANAGER account (not via public registration — direct DB insert)
        String email = "storemanager-sec@test.com";
        userRepository.save(User.builder()
                .firstName("Store")
                .lastName("Manager")
                .email(email)
                .password(passwordEncoder.encode("StrongPassword123!"))
                .role(Role.STORE_MANAGER)
                .enabled(true)
                .status(AccountStatus.ACTIVE)
                .build());

        Cookie[] cookies = loginAndGetCookies(email, "StrongPassword123!");
        mockMvc.perform(get("/api/admin/store-applications").cookie(cookies))
                .andExpect(status().isForbidden());
    }

    @Test
    void driver_cannotAccessAdminApplicationList() throws Exception {
        String email = "rider-sec@test.com";
        userRepository.save(User.builder()
                .firstName("Delivery")
                .lastName("Rider")
                .email(email)
                .password(passwordEncoder.encode("StrongPassword123!"))
                .role(Role.DRIVER)
                .enabled(true)
                .status(AccountStatus.ACTIVE)
                .build());

        Cookie[] cookies = loginAndGetCookies(email, "StrongPassword123!");
        mockMvc.perform(get("/api/admin/store-applications").cookie(cookies))
                .andExpect(status().isForbidden());
    }

    @Test
    void admin_canAccessAdminApplicationLists() throws Exception {
        Cookie[] cookies = loginAndGetCookies("admin@freshora.test", "FreshoraAdmin123!");

        mockMvc.perform(get("/api/admin/store-applications").cookie(cookies))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/admin/driver-applications").cookie(cookies))
                .andExpect(status().isOk());
    }

    // ──────────────────────────────────────────────────────────
    // SECURITY TEST SUITE — APPLICATION SUBMISSION AUTH
    // ──────────────────────────────────────────────────────────

    @Test
    void storeApplicationSubmission_requiresAuthentication() throws Exception {
        // No JWT cookie — must reject with 401 (or 403 due to CSRF, but 401 is expected with no auth)
        String payload = """
                {
                  "applicantName": "Test",
                  "email": "test@test.com",
                  "contactNumber": "+94112345678",
                  "preferredContactMethod": "email",
                  "storeName": "Test Store",
                  "storeContactNumber": "+94112345678",
                  "storeAddress": "123 Test St",
                  "city": "Colombo",
                  "storeType": "GROCERY"
                }
                """;

        mockMvc.perform(post("/api/applications/stores")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void driverApplicationSubmission_requiresAuthentication() throws Exception {
        String payload = """
                {
                  "fullName": "Test Driver",
                  "email": "driver@test.com",
                  "contactNumber": "+94112345678",
                  "dateOfBirth": "1990-01-01",
                  "address": "123 Main St",
                  "city": "Colombo",
                  "vehicleType": "MOTORBIKE",
                  "vehicleRegistrationNumber": "ABC-1234",
                  "ownershipType": "OWN",
                  "preferredArea": "Colombo",
                  "hasSmartphone": true
                }
                """;

        mockMvc.perform(post("/api/applications/drivers")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void applicationSubmission_requiresAllMandatoryDocuments() throws Exception {
        registerUser("missing-documents@test.com", "StrongPassword123!");
        Cookie[] cookies = loginAndGetCookies("missing-documents@test.com", "StrongPassword123!");
        String storePayload = """
                {
                  "applicantName": "Missing Documents",
                  "email": "missing-documents@test.com",
                  "contactNumber": "+94112345678",
                  "preferredContactMethod": "email",
                  "storeName": "Missing Documents Store",
                  "storeContactNumber": "+94112345678",
                  "storeAddress": "123 Test St",
                  "city": "Colombo",
                  "storeType": "GROCERY"
                }
                """;
        String driverPayload = """
                {
                  "fullName": "Missing Documents",
                  "email": "missing-documents@test.com",
                  "contactNumber": "+94112345678",
                  "dateOfBirth": "1990-01-01",
                  "address": "123 Main St",
                  "city": "Colombo",
                  "vehicleType": "MOTORBIKE",
                  "vehicleRegistrationNumber": "ABC-1234",
                  "ownershipType": "OWN",
                  "preferredArea": "Colombo",
                  "hasSmartphone": true
                }
                """;

        mockMvc.perform(storeApplicationMultipart(storePayload, "/api/applications/stores", false)
                        .with(csrf())
                        .cookie(cookies))
                .andExpect(status().isBadRequest())
                        .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString(
                                "Required application document is missing")));
        mockMvc.perform(driverApplicationMultipart(driverPayload, "/api/applications/drivers", false)
                        .with(csrf())
                        .cookie(cookies))
                .andExpect(status().isBadRequest())
                        .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString(
                                "Required application document is missing")));
    }

    @Test
    void storeApplicant_canResubmitAfterMoreInformationRequest() throws Exception {
        registerUser("store-resubmit@test.com", "StrongPassword123!");
        Cookie[] applicantCookies = loginAndGetCookies("store-resubmit@test.com", "StrongPassword123!");
        String payload = """
                {
                  "applicantName": "Store Resubmit",
                  "email": "store-resubmit@test.com",
                  "contactNumber": "+94112345678",
                  "preferredContactMethod": "email",
                  "storeName": "Original Store Name",
                  "storeContactNumber": "+94112345678",
                  "storeAddress": "123 Test St",
                  "city": "Colombo",
                  "storeType": "GROCERY"
                }
                """;
        var submitted = mockMvc.perform(storeApplicationMultipart(payload)
                        .with(csrf())
                        .cookie(applicantCookies))
                .andExpect(status().isCreated())
                .andReturn();
        String applicationId = objectMapper.readTree(submitted.getResponse().getContentAsString()).get("id").asString();

        Cookie[] adminCookies = loginAndGetCookies("admin@freshora.test", "FreshoraAdmin123!");
        mockMvc.perform(post("/api/admin/store-applications/{id}/request-information", applicationId)
                        .with(csrf())
                        .cookie(adminCookies)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"note\":\"Please provide a clearer registration document\"}"))
                .andExpect(status().isOk());

        mockMvc.perform(multipart(HttpMethod.PUT, "/api/applications/stores/{id}", applicationId)
                        .param("applicantName", "Store Resubmit")
                        .param("email", "store-resubmit@test.com")
                        .param("contactNumber", "+94112345678")
                        .param("preferredContactMethod", "email")
                        .param("storeName", "Updated Store Name")
                        .param("storeContactNumber", "+94112345678")
                        .param("storeAddress", "123 Test St")
                        .param("city", "Colombo")
                        .param("storeType", "GROCERY")
                        .with(csrf())
                        .cookie(applicantCookies))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING_REVIEW"))
                .andExpect(jsonPath("$.storeName").value("Updated Store Name"))
                .andExpect(jsonPath("$.reviewNotes").doesNotExist())
                .andExpect(jsonPath("$.history.length()").value(3));

        mockMvc.perform(get("/api/applications/stores/{id}", applicationId).cookie(applicantCookies))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.documents.length()").value(3));
    }

    @Test
    void driverApplicant_canResubmitAfterMoreInformationRequest() throws Exception {
        registerUser("driver-resubmit@test.com", "StrongPassword123!");
        Cookie[] applicantCookies = loginAndGetCookies("driver-resubmit@test.com", "StrongPassword123!");
        String payload = """
                {
                  "fullName": "Driver Resubmit",
                  "email": "driver-resubmit@test.com",
                  "contactNumber": "+94112345678",
                  "dateOfBirth": "1990-01-01",
                  "address": "123 Main St",
                  "city": "Colombo",
                  "vehicleType": "MOTORBIKE",
                  "vehicleRegistrationNumber": "RES-1234",
                  "ownershipType": "OWN",
                  "preferredArea": "Colombo",
                  "hasSmartphone": true
                }
                """;
        var submitted = mockMvc.perform(driverApplicationMultipart(payload)
                        .with(csrf())
                        .cookie(applicantCookies))
                .andExpect(status().isCreated())
                .andReturn();
        String applicationId = objectMapper.readTree(submitted.getResponse().getContentAsString()).get("id").asString();

        Cookie[] adminCookies = loginAndGetCookies("admin@freshora.test", "FreshoraAdmin123!");
        mockMvc.perform(post("/api/admin/driver-applications/{id}/request-information", applicationId)
                        .with(csrf())
                        .cookie(adminCookies)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"note\":\"Please verify the vehicle registration details\"}"))
                .andExpect(status().isOk());

        mockMvc.perform(multipart(HttpMethod.PUT, "/api/applications/drivers/{id}", applicationId)
                        .param("fullName", "Driver Resubmit")
                        .param("email", "driver-resubmit@test.com")
                        .param("contactNumber", "+94112345678")
                        .param("dateOfBirth", "1990-01-01")
                        .param("address", "123 Main St")
                        .param("city", "Colombo")
                        .param("vehicleType", "MOTORBIKE")
                        .param("vehicleRegistrationNumber", "RES-1234")
                        .param("ownershipType", "OWN")
                        .param("preferredArea", "Colombo")
                        .param("hasSmartphone", "true")
                        .with(csrf())
                        .cookie(applicantCookies))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING_REVIEW"))
                .andExpect(jsonPath("$.history.length()").value(3));

        mockMvc.perform(get("/api/applications/drivers/{id}", applicationId).cookie(applicantCookies))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.documents.length()").value(4));
    }

    @Test
    void storeApplication_statusIsAlwaysPendingReview_regardlessOfClientField() throws Exception {
        // An authenticated customer submits a store application.
        // The backend must always set status=PENDING_REVIEW, ignoring any status field in request.
        registerUser("status-tamper@test.com", "StrongPassword123!");
        Cookie[] cookies = loginAndGetCookies("status-tamper@test.com", "StrongPassword123!");

        // Attempt to include status=APPROVED in the payload — it must be silently ignored
        String payload = """
                {
                  "applicantName": "Status Tamper",
                  "email": "status-tamper@test.com",
                  "contactNumber": "+94112345678",
                  "preferredContactMethod": "email",
                  "storeName": "Tamper Store",
                  "storeContactNumber": "+94112345678",
                  "storeAddress": "123 Tamper St",
                  "city": "Colombo",
                  "storeType": "GROCERY",
                  "status": "APPROVED",
                  "role": "ADMIN"
                }
                """;

        var result = mockMvc.perform(storeApplicationMultipart(payload)
                        .with(csrf())
                        .cookie(cookies))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode response = objectMapper.readTree(result.getResponse().getContentAsString());
        // Status must always be PENDING_REVIEW — never the client-sent value
        assertThat(response.get("status").asString()).isEqualTo("PENDING_REVIEW");
    }

    // ──────────────────────────────────────────────────────────
    // SECURITY TEST SUITE — APPLICATION IDOR / OWNERSHIP
    // ──────────────────────────────────────────────────────────

    @Test
    void application_ownershipIsolation_userACannotAccessUserBApplication() throws Exception {
        // User A creates an application
        registerUser("idor-user-a@test.com", "StrongPassword123!");
        registerUser("idor-user-b@test.com", "StrongPassword123!");

        Cookie[] userACookies = loginAndGetCookies("idor-user-a@test.com", "StrongPassword123!");

        String payload = """
                {
                  "applicantName": "User A",
                  "email": "idor-user-a@test.com",
                  "contactNumber": "+94112345678",
                  "preferredContactMethod": "email",
                  "storeName": "User A Store",
                  "storeContactNumber": "+94112345678",
                  "storeAddress": "123 A St",
                  "city": "Colombo",
                  "storeType": "GROCERY"
                }
                """;

        var submitResult = mockMvc.perform(storeApplicationMultipart(payload)
                        .with(csrf())
                        .cookie(userACookies))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode submitted = objectMapper.readTree(submitResult.getResponse().getContentAsString());
        String applicationId = submitted.get("id").asString();

        // User B tries to access User A's application by ID
        Cookie[] userBCookies = loginAndGetCookies("idor-user-b@test.com", "StrongPassword123!");
        mockMvc.perform(get("/api/applications/stores/{id}", applicationId).cookie(userBCookies))
                .andExpect(status().isUnauthorized()); // AuthenticationException → 401
    }

    @Test
    void application_ownerCanAccessOwnApplication() throws Exception {
        registerUser("own-app-access@test.com", "StrongPassword123!");
        Cookie[] cookies = loginAndGetCookies("own-app-access@test.com", "StrongPassword123!");

        String payload = """
                {
                  "applicantName": "Own Access",
                  "email": "own-app-access@test.com",
                  "contactNumber": "+94112345678",
                  "preferredContactMethod": "email",
                  "storeName": "Own Store",
                  "storeContactNumber": "+94112345678",
                  "storeAddress": "123 Own St",
                  "city": "Colombo",
                  "storeType": "GROCERY"
                }
                """;

        var submitResult = mockMvc.perform(storeApplicationMultipart(payload)
                        .with(csrf())
                        .cookie(cookies))
                .andExpect(status().isCreated())
                .andReturn();

        String applicationId = objectMapper.readTree(submitResult.getResponse().getContentAsString()).get("id").asString();

        // Owner can access their own application
        mockMvc.perform(get("/api/applications/stores/{id}", applicationId).cookie(cookies))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(applicationId));
    }

    // ──────────────────────────────────────────────────────────
    // SECURITY TEST SUITE — ADMIN APPLICATION REVIEW
    // ──────────────────────────────────────────────────────────

    @Test
    void customer_cannotApproveStoreApplication() throws Exception {
        // Admin creates an application to review
        registerUser("applicant-for-admin@test.com", "StrongPassword123!");
        Cookie[] applicantCookies = loginAndGetCookies("applicant-for-admin@test.com", "StrongPassword123!");

        String payload = """
                {
                  "applicantName": "Applicant For Admin",
                  "email": "applicant-for-admin@test.com",
                  "contactNumber": "+94112345678",
                  "preferredContactMethod": "email",
                  "storeName": "Admin Review Store",
                  "storeContactNumber": "+94112345678",
                  "storeAddress": "123 Admin St",
                  "city": "Colombo",
                  "storeType": "GROCERY"
                }
                """;
        var submitResult = mockMvc.perform(storeApplicationMultipart(payload)
                        .with(csrf())
                        .cookie(applicantCookies))
                .andExpect(status().isCreated())
                .andReturn();
        String appId = objectMapper.readTree(submitResult.getResponse().getContentAsString()).get("id").asString();

        // A different regular customer tries to approve this application
        registerUser("fake-reviewer@test.com", "StrongPassword123!");
        Cookie[] fakeReviewerCookies = loginAndGetCookies("fake-reviewer@test.com", "StrongPassword123!");

        mockMvc.perform(post("/api/admin/store-applications/{id}/approve", appId)
                        .with(csrf())
                        .cookie(fakeReviewerCookies))
                .andExpect(status().isForbidden());
    }

    @Test
    void admin_canApproveStoreApplication() throws Exception {
        registerUser("applicant-for-approval@test.com", "StrongPassword123!");
        Cookie[] applicantCookies = loginAndGetCookies("applicant-for-approval@test.com", "StrongPassword123!");

        String payload = """
                {
                  "applicantName": "Applicant For Approval",
                  "email": "applicant-for-approval@test.com",
                  "contactNumber": "+94112345678",
                  "preferredContactMethod": "email",
                  "storeName": "Approval Test Store",
                  "storeContactNumber": "+94112345678",
                  "storeAddress": "123 Approval St",
                  "city": "Colombo",
                  "storeType": "GROCERY"
                }
                """;
        var submitResult = mockMvc.perform(storeApplicationMultipart(payload)
                        .with(csrf())
                        .cookie(applicantCookies))
                .andExpect(status().isCreated())
                .andReturn();
        String appId = objectMapper.readTree(submitResult.getResponse().getContentAsString()).get("id").asString();

        Cookie[] adminCookies = loginAndGetCookies("admin@freshora.test", "FreshoraAdmin123!");
        mockMvc.perform(post("/api/admin/store-applications/{id}/approve", appId)
                        .with(csrf())
                        .cookie(adminCookies))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());

        User provisionedUser = userRepository.findByEmail("applicant-for-approval@test.com").orElseThrow();
        assertThat(provisionedUser.getRole()).isEqualTo(Role.STORE_MANAGER);
        assertThat(provisionedUser.getStatus()).isEqualTo(AccountStatus.PENDING);
        assertThat(provisionedUser.isEnabled()).isFalse();
    }

    @Test
    void admin_canApproveDriverApplication_andProvisionInactiveDriverAccount() throws Exception {
        registerUser("driver-applicant-approval@test.com", "StrongPassword123!");
        Cookie[] applicantCookies = loginAndGetCookies("driver-applicant-approval@test.com", "StrongPassword123!");
        String payload = """
                {
                  "fullName": "Driver Approval",
                  "email": "driver-applicant-approval@test.com",
                  "contactNumber": "+94112345678",
                  "dateOfBirth": "1990-01-01",
                  "address": "123 Main St",
                  "city": "Colombo",
                  "vehicleType": "MOTORBIKE",
                  "vehicleRegistrationNumber": "APR-1234",
                  "ownershipType": "OWN",
                  "preferredArea": "Colombo",
                  "hasSmartphone": true
                }
                """;
        var submitted = mockMvc.perform(driverApplicationMultipart(payload)
                        .with(csrf())
                        .cookie(applicantCookies))
                .andExpect(status().isCreated())
                .andReturn();
        String applicationId = objectMapper.readTree(submitted.getResponse().getContentAsString()).get("id").asString();

        Cookie[] adminCookies = loginAndGetCookies("admin@freshora.test", "FreshoraAdmin123!");
        mockMvc.perform(post("/api/admin/driver-applications/{id}/approve", applicationId)
                        .with(csrf())
                        .cookie(adminCookies))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());

        User provisionedUser = userRepository.findByEmail("driver-applicant-approval@test.com").orElseThrow();
        assertThat(provisionedUser.getRole()).isEqualTo(Role.DRIVER);
        assertThat(provisionedUser.getStatus()).isEqualTo(AccountStatus.PENDING);
        assertThat(provisionedUser.isEnabled()).isFalse();
    }

    @Test
    void admin_canRejectDriverApplication() throws Exception {
        registerUser("driver-applicant-reject@test.com", "StrongPassword123!");
        Cookie[] applicantCookies = loginAndGetCookies("driver-applicant-reject@test.com", "StrongPassword123!");

        String payload = """
                {
                  "fullName": "Reject Driver",
                  "email": "driver-applicant-reject@test.com",
                  "contactNumber": "+94112345678",
                  "dateOfBirth": "1990-01-01",
                  "address": "123 Main St",
                  "city": "Colombo",
                  "vehicleType": "MOTORBIKE",
                  "vehicleRegistrationNumber": "REJ-1234",
                  "ownershipType": "OWN",
                  "preferredArea": "Colombo",
                  "hasSmartphone": true
                }
                """;
        var submitResult = mockMvc.perform(driverApplicationMultipart(payload)
                        .with(csrf())
                        .cookie(applicantCookies))
                .andExpect(status().isCreated())
                .andReturn();
        String appId = objectMapper.readTree(submitResult.getResponse().getContentAsString()).get("id").asString();

        Cookie[] adminCookies = loginAndGetCookies("admin@freshora.test", "FreshoraAdmin123!");
        mockMvc.perform(post("/api/admin/driver-applications/{id}/reject", appId)
                        .with(csrf())
                        .cookie(adminCookies)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"note\": \"Does not meet requirements\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());
    }

    // ──────────────────────────────────────────────────────────
    // SECURITY TEST SUITE — PASSWORD RESET
    // ──────────────────────────────────────────────────────────

    @Test
    void forgotPassword_withUnknownEmail_returnsGenericMessage() throws Exception {
        // Must not reveal that the email doesn't exist
        mockMvc.perform(post("/api/auth/forgot-password")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ForgotPasswordRequest("nonexistent-user@unknown.com"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("If an account exists for this email, a reset link was sent"));
    }

    @Test
    void passwordReset_withInvalidToken_shouldFail() {
        var result = org.junit.jupiter.api.Assertions.assertThrows(
                Exception.class,
                () -> authService.resetPassword("completely-invalid-token", "NewPassword123!")
        );
        assertThat(result).isNotNull();
    }

    @Test
    void passwordReset_reusedToken_shouldFail() {
        User user = userRepository.save(User.builder()
                .firstName("Reuse")
                .lastName("Reset")
                .email("reuse-reset@test.com")
                .password(passwordEncoder.encode("OldPassword123!"))
                .role(Role.CUSTOMER)
                .enabled(true)
                .status(AccountStatus.ACTIVE)
                .build());

        String token = authService.createPasswordResetToken(user);
        // First use succeeds
        assertThat(authService.resetPassword(token, "NewPassword123!").message()).isEqualTo("Password reset successful");
        // Second use with same token must fail (token is deleted after use)
        org.junit.jupiter.api.Assertions.assertThrows(
                Exception.class,
                () -> authService.resetPassword(token, "AnotherPassword123!")
        );
    }

    // ──────────────────────────────────────────────────────────
    // SECURITY TEST SUITE — ACCOUNT SETUP
    // ──────────────────────────────────────────────────────────

    @Test
    void accountSetup_reusedToken_shouldFail() {
        User user = userRepository.save(User.builder()
                .firstName("Reuse")
                .lastName("Setup")
                .email("reuse-setup@test.com")
                .password(passwordEncoder.encode("temp-hash"))
                .role(Role.STORE_MANAGER)
                .enabled(false)
                .status(AccountStatus.PENDING)
                .build());

        String token = authService.createAccountSetupToken(user);
        // First use succeeds
        assertThat(authService.setupAccount(token, "SetupPassword123!").message()).isEqualTo("Account setup complete");
        // Second use: account is now ACTIVE+enabled → ConflictException
        org.junit.jupiter.api.Assertions.assertThrows(
                Exception.class,
                () -> authService.setupAccount(token, "AnotherSetup123!")
        );
    }

    @Test
    void accountSetup_invalidToken_shouldFail() {
        org.junit.jupiter.api.Assertions.assertThrows(
                Exception.class,
                () -> authService.setupAccount("invalid-setup-token-xyz", "Password123!")
        );
    }

    // ──────────────────────────────────────────────────────────
    // SECURITY TEST SUITE — REFRESH TOKEN
    // ──────────────────────────────────────────────────────────

    @Test
    void refresh_withMissingCookie_shouldFail() throws Exception {
        // No refresh cookie = must reject
        mockMvc.perform(post("/api/auth/refresh")
                        .with(csrf()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void refresh_withInvalidToken_shouldFail() throws Exception {
        Cookie invalidRefresh = new Cookie("FRESHORA_REFRESH_TOKEN", "definitely-not-a-valid-jwt");
        mockMvc.perform(post("/api/auth/refresh")
                        .with(csrf())
                        .cookie(invalidRefresh))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void logout_clearsSession() throws Exception {
        registerUser("logout-test@test.com", "StrongPassword123!");
        Cookie[] cookies = loginAndGetCookies("logout-test@test.com", "StrongPassword123!");

        // Confirm authenticated
        mockMvc.perform(get("/api/users/me").cookie(cookies))
                .andExpect(status().isOk());

        // Logout
        mockMvc.perform(post("/api/auth/logout")
                        .with(csrf())
                        .cookie(cookies))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Logout successful"));
    }

    @Test
    void csrf_missingToken_shouldRejectMutation() throws Exception {
        // POST without CSRF token should fail with 403
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("any@test.com", "AnyPassword123!"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void noAuth_cannotCallApplicationsMe() throws Exception {
        mockMvc.perform(get("/api/applications/me"))
                .andExpect(status().isUnauthorized());
    }

    // ──────────────────────────────────────────────────────────
    // HELPERS
    // ──────────────────────────────────────────────────────────

    private void registerUser(String email, String password) throws Exception {
        RegisterRequest request = new RegisterRequest("Test", "User", email, password);
        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    private Cookie[] loginAndGetCookies(String email, String password) throws Exception {
        var loginResult = mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(email, password))))
                .andExpect(status().isOk())
                .andReturn();
        return loginResult.getResponse().getCookies();
    }

    private MockMultipartHttpServletRequestBuilder storeApplicationMultipart(String payload) throws Exception {
        return storeApplicationMultipart(payload, "/api/applications/stores", true);
    }

    private MockMultipartHttpServletRequestBuilder storeApplicationMultipart(
            String payload, String path, boolean includeDocuments) throws Exception {
        MockMultipartHttpServletRequestBuilder request = multipart(path);
        if (includeDocuments) {
            request.file(new MockMultipartFile("logo", "logo.png", "image/png", new byte[]{1}))
                    .file(new MockMultipartFile("businessRegistration", "registration.pdf", "application/pdf", new byte[]{1}))
                    .file(new MockMultipartFile("identityDocument", "identity.pdf", "application/pdf", new byte[]{1}));
        }
        addMultipartFields(request, payload);
        return request;
    }

    private MockMultipartHttpServletRequestBuilder driverApplicationMultipart(String payload) throws Exception {
        return driverApplicationMultipart(payload, "/api/applications/drivers", true);
    }

    private MockMultipartHttpServletRequestBuilder driverApplicationMultipart(
            String payload, String path, boolean includeDocuments) throws Exception {
        MockMultipartHttpServletRequestBuilder request = multipart(path);
        if (includeDocuments) {
            request.file(new MockMultipartFile("photo", "photo.png", "image/png", new byte[]{1}))
                    .file(new MockMultipartFile("vehicleRegistrationDoc", "registration.pdf", "application/pdf", new byte[]{1}))
                    .file(new MockMultipartFile("identityDocument", "identity.pdf", "application/pdf", new byte[]{1}))
                    .file(new MockMultipartFile("licenseFront", "license.pdf", "application/pdf", new byte[]{1}));
        }
        addMultipartFields(request, payload);
        return request;
    }

    private void addMultipartFields(MockMultipartHttpServletRequestBuilder request, String payload) throws Exception {
        Map<String, Object> fields = objectMapper.readValue(payload, new TypeReference<>() { });
        fields.forEach((name, value) -> {
            String parameter = value instanceof Iterable<?> values
                    ? java.util.stream.StreamSupport.stream(values.spliterator(), false)
                            .map(String::valueOf)
                            .collect(java.util.stream.Collectors.joining(","))
                    : String.valueOf(value);
            request.param(name, parameter);
        });
    }
}
