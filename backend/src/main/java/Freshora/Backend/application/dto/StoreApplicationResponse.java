package Freshora.Backend.application.dto;

import java.util.List;

public record StoreApplicationResponse(
        String id,
        String applicantName,
        String email,
        String contactNumber,
        String alternateContactNumber,
        String preferredContactMethod,
        String applicantNotes,
        String storeContactNumber,
        String storeEmail,
        String storeName,
        String storeAddress,
        String city,
        String province,
        String postalCode,
        String storeType,
        String registrationNumber,
        String storeDescription,
        List<ApplicationDocumentResponse> documents,
        String status,
        String submittedAt,
        String updatedAt,
        String reviewedBy,
        String reviewNotes,
        List<ApplicationHistoryEntry> history
) {}
