package Freshora.Backend.application.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record StoreApplicationRequest(
        @NotBlank(message = "Applicant name is required") String applicantName,
        @NotBlank(message = "Email is required") @Email(message = "Enter a valid email address") String email,
        @NotBlank(message = "Contact number is required") String contactNumber,
        String alternateContactNumber,
        @NotBlank(message = "Preferred contact method is required") String preferredContactMethod,
        String applicantNotes,
        @NotBlank(message = "Store name is required") String storeName,
        @NotBlank(message = "Store contact number is required") String storeContactNumber,
        String storeEmail,
        @NotBlank(message = "Store address is required") String storeAddress,
        @NotBlank(message = "City is required") String city,
        String province,
        String postalCode,
        @NotBlank(message = "Store type is required") String storeType,
        String registrationNumber,
        String storeDescription
) {}
