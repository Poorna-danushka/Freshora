package Freshora.Backend.config;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletResponse;
import java.time.Duration;

@Component
public class CookieSupport {
    private final CookieProperties cookieProperties;

    public CookieSupport(CookieProperties cookieProperties) {
        this.cookieProperties = cookieProperties;
    }

    public void addAccessTokenCookie(HttpServletResponse response, String token, long maxAgeMillis) {
        addCookie(response, cookieProperties.getAccessCookieName(), token, "/", true, maxAgeMillis, cookieProperties.isCookieSecure(), cookieProperties.getCookieSameSite());
    }

    public void addRefreshTokenCookie(HttpServletResponse response, String token, long maxAgeMillis) {
        addCookie(response, cookieProperties.getRefreshCookieName(), token, "/api/auth", true, maxAgeMillis, cookieProperties.isCookieSecure(), cookieProperties.getCookieSameSite());
    }

    public void addCsrfCookie(HttpServletResponse response, String token) {
        addCookie(response, cookieProperties.getCsrfCookieName(), token, "/", false, 60L * 60L * 24L * 7L, cookieProperties.isCookieSecure(), "Lax");
    }

    public void clearCookie(HttpServletResponse response, String name, String path) {
        addCookie(response, name, "", path, true, 0L, cookieProperties.isCookieSecure(), cookieProperties.getCookieSameSite());
    }

    private void addCookie(HttpServletResponse response, String name, String value, String path, boolean httpOnly,
                           long maxAgeMillis, boolean secure, String sameSite) {
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .httpOnly(httpOnly)
                .secure(secure)
                .path(path)
                .sameSite(sameSite)
                .maxAge(Duration.ofMillis(maxAgeMillis))
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
