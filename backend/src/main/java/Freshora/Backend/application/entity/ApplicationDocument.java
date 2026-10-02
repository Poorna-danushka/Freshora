package Freshora.Backend.application.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;

@Entity
@Table(name = "application_documents",
        uniqueConstraints = @UniqueConstraint(name = "uk_application_documents_storage_key", columnNames = "storage_key"),
        indexes = @Index(name = "idx_application_document_owner", columnList = "applicationType,applicationId"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApplicationDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private java.util.UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "application_type", nullable = false)
    private ApplicationType applicationType;

    @Column(name = "application_id", nullable = false)
    private java.util.UUID applicationId;
    @Column(nullable = false) private String documentType;
    @Column(nullable = false) private String originalFileName;
    @Column(nullable = false) private String storageKey;
    @Column(nullable = false) private String contentType;
    @Column(nullable = false) private long fileSize;
    @CreationTimestamp @Column(nullable = false, updatable = false) private Instant uploadedAt;
}
