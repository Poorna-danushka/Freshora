package Freshora.Backend.user.entity;

/**
 * Account state is enforced by the backend. Roles describe permissions;
 * status determines whether an account may authenticate.
 */
public enum AccountStatus {
    PENDING,
    ACTIVE,
    DISABLED,
    SUSPENDED
}
