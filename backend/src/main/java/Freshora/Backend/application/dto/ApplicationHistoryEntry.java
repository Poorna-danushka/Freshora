package Freshora.Backend.application.dto;

public record ApplicationHistoryEntry(
        String at,
        String status,
        String actor,
        String note
) {}
