package Freshora.Backend.auth.dto;

import java.util.UUID;

/**
 * Response after submitting a store or driver application
 */
public record ApplicationSubmittedResponse(
        String message,
        UUID applicationId,
        String applicationType, // "STORE" or "DRIVER"
        String status, // "PENDING", "UNDER_REVIEW"
        String email,
        String nextSteps
) {
    public static ApplicationSubmittedResponse forStoreApplication(UUID applicationId, String email) {
        return new ApplicationSubmittedResponse(
                "Store partner application submitted successfully",
                applicationId,
                "STORE",
                "PENDING",
                email,
                "Your application is under review. We will contact you at " + email + " within 2-3 business days."
        );
    }

    public static ApplicationSubmittedResponse forDriverApplication(UUID applicationId, String email) {
        return new ApplicationSubmittedResponse(
                "Driver application submitted successfully",
                applicationId,
                "DRIVER",
                "PENDING",
                email,
                "Your application is under review. We will contact you at " + email + " within 2-3 business days."
        );
    }
}
