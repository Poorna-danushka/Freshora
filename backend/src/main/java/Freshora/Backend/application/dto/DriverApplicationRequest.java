package Freshora.Backend.application.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record DriverApplicationRequest(
        @NotBlank(message = "Full name is required") String fullName,
        @NotBlank(message = "Email is required") @Email(message = "Enter a valid email address") String email,
        @NotBlank(message = "Contact number is required") String contactNumber,
        @NotBlank(message = "Date of birth is required") String dateOfBirth,
        @NotBlank(message = "Address is required") String address,
        @NotBlank(message = "City is required") String city,
        String province,
        String emergencyContactName,
        String emergencyContactNumber,
        @NotBlank(message = "Vehicle type is required") String vehicleType,
        @NotBlank(message = "Vehicle registration number is required") String vehicleRegistrationNumber,
        String vehicleMake,
        String vehicleModel,
        String vehicleYear,
        String vehicleColor,
        @NotBlank(message = "Ownership type is required") String ownershipType,
        @NotBlank(message = "Preferred area is required") String preferredArea,
        String preferredWorkingDays,
        String preferredWorkingHours,
        String deliveryExperience,
        boolean hasSmartphone,
        Boolean hasDeliveryBag,
        String additionalNotes,
        String licenseNumber
) {
    public DriverApplicationRequest(
            String fullName, String email, String contactNumber, String dateOfBirth,
            String address, String city, String province, String emergencyContactName,
            String emergencyContactNumber, String vehicleType, String vehicleRegistrationNumber,
            String vehicleMake, String vehicleModel, String vehicleYear, String vehicleColor,
            String ownershipType, String preferredArea, String preferredWorkingDays,
            String preferredWorkingHours, String deliveryExperience, boolean hasSmartphone,
            Boolean hasDeliveryBag, String additionalNotes
    ) {
        this(fullName, email, contactNumber, dateOfBirth, address, city, province,
             emergencyContactName, emergencyContactNumber, vehicleType, vehicleRegistrationNumber,
             vehicleMake, vehicleModel, vehicleYear, vehicleColor, ownershipType, preferredArea,
             preferredWorkingDays, preferredWorkingHours, deliveryExperience, hasSmartphone,
             hasDeliveryBag, additionalNotes, null);
    }
}
