package Freshora.Backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Store Partner Application Request
 * Multi-step registration for store owners/managers
 * This creates a pending account that needs admin approval
 */
public record StorePartnerApplicationRequest(
        // Step 1: Applicant Information
        @NotBlank(message = "Full name is required")
        @Size(min = 2, max = 255, message = "Full name must be between 2 and 255 characters")
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        String email,

        @NotBlank(message = "Personal contact number is required")
        @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Contact number must be valid")
        String personalContactNumber,

        @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Alternate contact number must be valid")
        String alternateContactNumber,

        @NotBlank(message = "Preferred contact method is required")
        @Pattern(regexp = "^(PHONE|EMAIL)$", message = "Preferred contact method must be PHONE or EMAIL")
        String preferredContactMethod,

        String notes,

        // Step 2: Store Information
        @NotBlank(message = "Store name is required")
        @Size(min = 2, max = 255, message = "Store name must be between 2 and 255 characters")
        String storeName,

        @NotBlank(message = "Store contact number is required")
        @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Store contact number must be valid")
        String storeContactNumber,

        @NotBlank(message = "Store address is required")
        @Size(min = 10, max = 500, message = "Store address must be between 10 and 500 characters")
        String storeAddress,

        @NotBlank(message = "City is required")
        String city,

        @NotNull(message = "Latitude is required")
        Double latitude,

        @NotNull(message = "Longitude is required")
        Double longitude,

        String storeLogoUrl,

        // Step 3: Business Documents
        String businessRegistrationNumber,

        String businessRegistrationType, // e.g., "LLC", "Sole Proprietorship", "Corporation"

        // Document file paths/URLs are handled separately via multipart upload
        // These fields just indicate if documents were provided
        Boolean hasBusinessRegistrationDocument,

        Boolean hasBusinessLicense,

        Boolean hasFoodSafetyCertificate,

        String additionalInfo,

        // Password for the account
        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
            message = "Password must contain at least one uppercase letter, one lowercase letter, and one number"
        )
        String password
) {}
