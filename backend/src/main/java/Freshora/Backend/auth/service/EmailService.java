package Freshora.Backend.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender javaMailSender;

    @Value("${freshora.mail.from:${MAIL_FROM:}}")
    private String fromAddress;

    @Value("${freshora.mail.from-name:${MAIL_FROM_NAME:Freshora}}")
    private String fromName;

    @Value("${freshora.frontend-url:${FRESHORA_FRONTEND_URL:http://localhost:5173}}")
    private String frontendUrl;

    public void sendPasswordResetEmail(String toAddress, String token) {
        if (!isConfigured() || !StringUtils.hasText(toAddress)) {
            return;
        }

        String resetUrl = frontendUrl.endsWith("/")
                ? frontendUrl + "reset-password?token=" + token
                : frontendUrl + "/reset-password?token=" + token;

        sendEmail(toAddress, "Reset your Freshora password",
                "To reset your Freshora password, open the secure link below.\n"
                        + "The link expires in 1 hour.\n\n"
                        + resetUrl + "\n\n"
                        + "If you did not request a password reset, you can safely ignore this email.");
    }

    public void sendAccountSetupEmail(String toAddress, String token) {
        if (!isConfigured() || !StringUtils.hasText(toAddress)) {
            return;
        }

        String setupUrl = frontendUrl.endsWith("/")
                ? frontendUrl + "setup-account?token=" + token
                : frontendUrl + "/setup-account?token=" + token;

        sendEmail(toAddress, "Complete your Freshora account setup",
                "Welcome to Freshora. Your application has been approved.\n"
                        + "Complete your account setup using the secure link below.\n"
                        + "The link expires in 7 days.\n\n"
                        + setupUrl);
    }

    private void sendEmail(String toAddress, String subject, String body) {
        if (!isConfigured()) {
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(StringUtils.hasText(fromName) ? fromName + " <" + fromAddress + ">" : fromAddress);
        message.setTo(toAddress);
        message.setSubject(subject);
        message.setText(body);
        javaMailSender.send(message);
    }

    private boolean isConfigured() {
        return javaMailSender != null && StringUtils.hasText(fromAddress);
    }
}
