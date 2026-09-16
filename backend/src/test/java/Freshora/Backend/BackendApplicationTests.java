package Freshora.Backend;

import Freshora.Backend.auth.dto.LoginRequest;
import Freshora.Backend.auth.dto.RegisterRequest;
import Freshora.Backend.user.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
    }

    @Autowired
    private UserRepository userRepository;

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

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("FRESHORA_ACCESS_TOKEN"))
                .andExpect(cookie().exists("FRESHORA_REFRESH_TOKEN"))
                .andExpect(jsonPath("$.message").value("Login successful"));
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

    private void registerUser(String email, String password) throws Exception {
        RegisterRequest request = new RegisterRequest("Test", "User", email, password);
        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }
}

