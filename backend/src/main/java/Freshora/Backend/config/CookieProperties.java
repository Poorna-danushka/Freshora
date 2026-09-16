package Freshora.Backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "freshora.security")
public class CookieProperties {
    private String accessCookieName = "FRESHORA_ACCESS_TOKEN";
    private String refreshCookieName = "FRESHORA_REFRESH_TOKEN";
    private String csrfCookieName = "XSRF-TOKEN";
    private boolean cookieSecure = false;
    private String cookieSameSite = "Lax";
}
