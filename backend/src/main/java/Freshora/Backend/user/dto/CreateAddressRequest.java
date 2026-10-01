package Freshora.Backend.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateAddressRequest(
        @NotBlank(message = "Label is required")
        @Size(max = 50, message = "Label must be at most 50 characters")
        String label,

        @NotBlank(message = "Recipient name is required")
        @Size(max = 100, message = "Recipient name must be at most 100 characters")
        String recipientName,

        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^[0-9+()\\-\\s]{7,20}$", message = "Phone number is invalid")
        String phone,

        @NotBlank(message = "Address line 1 is required")
        @Size(max = 200, message = "Address line 1 must be at most 200 characters")
        String addressLine1,

        @Size(max = 200, message = "Address line 2 must be at most 200 characters")
        String addressLine2,

        @NotBlank(message = "City is required")
        @Size(max = 100, message = "City must be at most 100 characters")
        String city,

        @NotBlank(message = "District is required")
        @Size(max = 100, message = "District must be at most 100 characters")
        String district,

        @Size(max = 20, message = "Postal code must be at most 20 characters")
        String postalCode,

        Double latitude,
        Double longitude,
        Boolean isDefault
) {}
