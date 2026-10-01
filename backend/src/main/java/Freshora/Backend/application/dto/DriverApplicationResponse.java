package Freshora.Backend.application.dto;

import java.util.List;

public record DriverApplicationResponse(
        String id,
        String fullName,
        String email,
        String contactNumber,
        String dateOfBirth,
        String address,
        String city,
        String province,
        String emergencyContactName,
        String emergencyContactNumber,
        String vehicleType,
        String vehicleRegistrationNumber,
        String vehicleMake,
        String vehicleModel,
        String vehicleYear,
        String vehicleColor,
        String ownershipType,
        String preferredArea,
        List<String> preferredWorkingDays,
        String preferredWorkingHours,
        String deliveryExperience,
        boolean hasSmartphone,
        Boolean hasDeliveryBag,
        String additionalNotes,
        List<ApplicationDocumentResponse> documents,
        String status,
        String submittedAt,
        String updatedAt,
        String reviewedBy,
        String reviewNotes,
        List<ApplicationHistoryEntry> history
) {}
