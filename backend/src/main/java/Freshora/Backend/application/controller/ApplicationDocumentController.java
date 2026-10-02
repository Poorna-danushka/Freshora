package Freshora.Backend.application.controller;

import Freshora.Backend.application.entity.ApplicationDocument;
import Freshora.Backend.application.repository.ApplicationDocumentRepository;
import Freshora.Backend.application.service.DocumentStorageService;
import Freshora.Backend.user.entity.Role;
import Freshora.Backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ApplicationDocumentController {
    private final ApplicationDocumentRepository applicationDocumentRepository;
    private final DocumentStorageService documentStorageService;

    @GetMapping("/admin/application-documents/{documentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Resource> getDocument(Authentication authentication, @PathVariable UUID documentId) throws IOException {
        User currentUser = (User) authentication.getPrincipal();
        if (!currentUser.hasRole(Role.ADMIN)) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied");
        }

        ApplicationDocument document = applicationDocumentRepository.findById(documentId)
                .orElseThrow(() -> new Freshora.Backend.exception.ResourceNotFoundException("Document not found"));

        Path filePath = documentStorageService.resolveFile(document.getStorageKey());
        byte[] fileBytes = Files.readAllBytes(filePath);
        String contentType = document.getContentType() == null ? MediaType.APPLICATION_OCTET_STREAM_VALUE : document.getContentType();

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + document.getOriginalFileName() + "\"")
                .body(new ByteArrayResource(fileBytes));
    }
}
