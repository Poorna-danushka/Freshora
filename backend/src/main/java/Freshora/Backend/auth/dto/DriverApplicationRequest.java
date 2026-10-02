package Freshora.Backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Driver Application Request
 * Multi-step registration for delivery drivers
 * This creates a pending account that needs admin approval
 */
public record DriverApplicationRequest(
        // Step 1: Personal Information
        @NotBlank(message = "Full name is required")
        @Size(min = 2, max = 255, message = "Full name must be between 2 and 255 characters")
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        String email,

        @NotBlank(message = "Contact number is required")
        @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Contact number must be valid")
        String contactNumber,

        @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Emergency contact number must be valid")
        String emergencyContactNumber,

        String emergencyContactName,

        @NotBlank(message = "Address is required")
        String address,

        @NotBlank(message = "City is required")
        String city,

        @NotBlank(message = "Preferred contact method is required")
        @Pattern(regexp = "^(PHONE|EMAIL)$", message = "Preferred contact method must be PHONE or EMAIL")
        String preferredContactMethod,

        String notes,

        // Step 2: Vehicle Information
        @NotBlank(message = "Vehicle type is required")
        @Pattern(
            regexp = "^(BIKE|SCOOTER|MOTORCYCLE|CAR|VAN)$",
            message = "Vehicle type must be one of: BIKE, SCOOTER, MOTORCYCLE, CAR, VAN"
        )
        String vehicleType,

        @NotBlank(message = "Vehicle make is required")
        String vehicleMake,

        @NotBlank(message = "Vehicle model is required")
        String vehicleModel,

        @NotNull(message = "Vehicle year is required")
        Integer vehicleYear,

        @NotBlank(message = "Vehicle registration number is required")
        String vehicleRegistrationNumber,

        @NotBlank(message = "Vehicle color is required")
        String vehicleColor,

        // Step 3: License & Documents
        @NotBlank(message = "Driver's license number is required")
        String licenseNumber,

        @NotBlank(message = "License issuing authority is required")
        String licenseIssuingAuthority,

        @NotNull(message = "License expiry date is required")
        String licenseExpiryDate, // Format: YYYY-MM-DD

        // Document indicators (actual files uploaded separately)
        Boolean hasDriversLicense,

        Boolean hasVehicleRegistration,

        Boolean hasInsuranceDocument,

        Boolean hasProfilePhoto,

        Boolean hasVehiclePhoto,

        // Step 4: Background & Availability
        Boolean hasDeliveryExperience,

        String previousDeliveryExperience, // Optional description

        @NotBlank(message = "Availability is required")
        String availability, // e.g., "FULL_TIME", "PART_TIME", "WEEKENDS"

        String preferredAreas, // Comma-separated list of preferred delivery areas

        Boolean agreedToTerms,

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
