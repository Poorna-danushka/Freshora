package Freshora.Backend.application.service;

import Freshora.Backend.application.entity.ApplicationDocument;
import Freshora.Backend.application.entity.ApplicationType;
import Freshora.Backend.exception.ResourceNotFoundException;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.unit.DataSize;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class DocumentStorageService {
    @Value("${freshora.storage.location:./uploads}")
    private String storageLocation;

    @Value("${spring.servlet.multipart.max-file-size:10MB}")
    private String maxFileSize;

    private Path rootDirectory;
    private long maxFileSizeBytes;

    @PostConstruct
    public void init() {
        rootDirectory = Paths.get(storageLocation).toAbsolutePath().normalize();
        maxFileSizeBytes = DataSize.parse(maxFileSize).toBytes();
        try {
            Files.createDirectories(rootDirectory);
        } catch (IOException e) {
            throw new IllegalStateException("Unable to initialize storage directory", e);
        }
    }

    public ApplicationDocument saveUploadedFile(MultipartFile file, ApplicationType applicationType, Long applicationId, String documentType, String label) {
        validate(file);

        String originalFileName = sanitizeFileName(file.getOriginalFilename());
        String extension = extractExtension(originalFileName);
        String storageKey = String.format(Locale.ROOT, "applications/%s/%d/%s%s",
                applicationType.name().toLowerCase(Locale.ROOT), applicationId, UUID.randomUUID(), extension);
        Path targetPath = rootDirectory.resolve(storageKey).normalize();
        if (!targetPath.startsWith(rootDirectory)) {
            throw new SecurityException("Invalid storage path");
        }

        try {
            Files.createDirectories(targetPath.getParent());
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to store uploaded document", e);
        }

        return ApplicationDocument.builder()
                .applicationType(applicationType)
                .applicationId(applicationId)
                .documentType(documentType)
                .originalFileName(originalFileName)
                .storageKey(storageKey)
                .contentType(file.getContentType() == null ? "application/octet-stream" : file.getContentType())
                .fileSize(file.getSize())
                .build();
    }

    public Path resolveFile(String storageKey) {
        if (storageKey == null || storageKey.isBlank() || storageKey.contains("..")) {
            throw new ResourceNotFoundException("Document not found");
        }
        Path filePath = rootDirectory.resolve(storageKey).normalize();
        if (!filePath.startsWith(rootDirectory)) {
            throw new SecurityException("Invalid storage path");
        }
        if (!Files.exists(filePath)) {
            throw new ResourceNotFoundException("Document not found");
        }
        return filePath;
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty");
        }
        if (file.getSize() > maxFileSizeBytes) {
            throw new IllegalArgumentException("Uploaded file exceeds the server size limit");
        }
        String originalFilename = sanitizeFileName(file.getOriginalFilename());
        String extension = extractExtension(originalFilename);
        Set<String> allowed = Set.of(".pdf", ".png", ".jpg", ".jpeg", ".webp", ".doc", ".docx", ".txt");
        if (!allowed.contains(extension.toLowerCase(Locale.ROOT))) {
            throw new IllegalArgumentException("Unsupported file type");
        }
    }

    private String sanitizeFileName(String fileName) {
        if (fileName == null || fileName.isBlank()) {
            throw new IllegalArgumentException("File name is required");
        }
        String normalized = fileName.replace('\\', '/');
        int lastSlash = normalized.lastIndexOf('/');
        String nameOnly = lastSlash >= 0 ? normalized.substring(lastSlash + 1) : normalized;
        if (nameOnly.isBlank() || nameOnly.contains("..") || nameOnly.startsWith(".")) {
            throw new IllegalArgumentException("Invalid file name");
        }
        return nameOnly;
    }

    private String extractExtension(String fileName) {
        int idx = fileName.lastIndexOf('.');
        return idx >= 0 ? fileName.substring(idx) : "";
    }
}
