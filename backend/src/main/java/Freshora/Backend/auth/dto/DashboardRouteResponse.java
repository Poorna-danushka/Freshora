package Freshora.Backend.auth.dto;

import Freshora.Backend.user.entity.Role;

import java.util.Set;

/**
 * Response indicating which dashboard the user should be routed to
 */
public record DashboardRouteResponse(
        String primaryDashboard,
        Set<Role> roles,
        Set<String> availableDashboards
) {
    public static DashboardRouteResponse from(Set<Role> roles) {
        String primaryDashboard = determinePrimaryDashboard(roles);
        Set<String> availableDashboards = roles.stream()
                .map(DashboardRouteResponse::getDashboardForRole)
                .collect(java.util.stream.Collectors.toSet());

        return new DashboardRouteResponse(primaryDashboard, roles, availableDashboards);
    }

    private static String determinePrimaryDashboard(Set<Role> roles) {
        // Priority order: ADMIN > STORE_MANAGER > DRIVER > STORE_STAFF > CUSTOMER
        if (roles.contains(Role.ADMIN)) return "/admin/dashboard";
        if (roles.contains(Role.STORE_MANAGER)) return "/store/dashboard";
        if (roles.contains(Role.DRIVER)) return "/driver/dashboard";
        if (roles.contains(Role.STORE_STAFF)) return "/staff/dashboard";
        return "/customer/dashboard";
    }

    private static String getDashboardForRole(Role role) {
        return switch (role) {
            case ADMIN -> "/admin/dashboard";
            case STORE_MANAGER -> "/store/dashboard";
            case STORE_STAFF -> "/staff/dashboard";
            case DRIVER -> "/driver/dashboard";
            case CUSTOMER -> "/customer/dashboard";
        };
    }
}
