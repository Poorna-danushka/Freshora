package Freshora.Backend.application.dto;

public record ApplicationDocumentResponse(
        String id,
        String kind,
        String label,
        boolean required,
        String fileName,
        String mimeType,
        Long sizeBytes,
        String uploadedAt
) {}
