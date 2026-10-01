package Freshora.Backend;

import Freshora.Backend.config.AdminBootstrapRunner;
import Freshora.Backend.user.entity.Role;
import Freshora.Backend.user.entity.User;
import Freshora.Backend.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AdminBootstrapRunnerTests {

    @Test
    void skipsBootstrapWhenAnyRequiredCredentialIsMissing() throws Exception {
        UserRepository repository = mock(UserRepository.class);
        PasswordEncoder encoder = mock(PasswordEncoder.class);
        AdminBootstrapRunner missingEmail = new AdminBootstrapRunner(repository, encoder, "", "password");
        AdminBootstrapRunner missingPassword = new AdminBootstrapRunner(repository, encoder, "admin@example.test", "");

        missingEmail.run(new DefaultApplicationArguments(new String[0]));
        missingPassword.run(new DefaultApplicationArguments(new String[0]));

        verifyNoInteractions(repository, encoder);
    }

    @Test
    void createsHashedAdminOnlyWhenNoAdminAlreadyExists() throws Exception {
        UserRepository repository = mock(UserRepository.class);
        PasswordEncoder encoder = mock(PasswordEncoder.class);
        when(repository.existsByRole(Role.ADMIN)).thenReturn(false, true);
        when(repository.existsByEmail("admin@example.test")).thenReturn(false);
        when(encoder.encode("supplied-password")).thenReturn("encoded-password");
        when(repository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        AdminBootstrapRunner runner = new AdminBootstrapRunner(
                repository, encoder, " Admin@Example.Test ", "supplied-password");

        runner.run(new DefaultApplicationArguments(new String[0]));
        runner.run(new DefaultApplicationArguments(new String[0]));

        var userCaptor = org.mockito.ArgumentCaptor.forClass(User.class);
        verify(repository, times(1)).save(userCaptor.capture());
        assertThat(userCaptor.getValue().getEmail()).isEqualTo("admin@example.test");
        assertThat(userCaptor.getValue().getRole()).isEqualTo(Role.ADMIN);
        assertThat(userCaptor.getValue().getPassword()).isEqualTo("encoded-password");
        verify(encoder, times(1)).encode("supplied-password");
    }

    @Test
    void refusesToSilentlySkipWhenConfiguredEmailBelongsToNonAdmin() {
        UserRepository repository = mock(UserRepository.class);
        PasswordEncoder encoder = mock(PasswordEncoder.class);
        when(repository.existsByRole(Role.ADMIN)).thenReturn(false);
        when(repository.existsByEmail("admin@example.test")).thenReturn(true);
        AdminBootstrapRunner runner = new AdminBootstrapRunner(
                repository, encoder, "admin@example.test", "supplied-password");

        assertThatThrownBy(() -> runner.run(new DefaultApplicationArguments(new String[0])))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Configured bootstrap admin email belongs to a non-admin account");
        verify(repository, never()).save(any(User.class));
        verifyNoInteractions(encoder);
    }
}
