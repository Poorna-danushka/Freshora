package Freshora.Backend.application.dto;

import jakarta.validation.constraints.NotBlank;

public record ApplicationReviewActionRequest(
        @NotBlank(message = "Review action is required") String action,
        String note
) {}
