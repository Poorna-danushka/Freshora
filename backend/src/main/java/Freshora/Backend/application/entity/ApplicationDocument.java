package Freshora.Backend.application.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;

@Entity
@Table(name = "application_documents", indexes = @Index(name = "idx_application_document_owner", columnList = "applicationType,applicationId"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApplicationDocument {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private ApplicationType applicationType;
    @Column(nullable = false) private Long applicationId;
    @Column(nullable = false) private String documentType;
    @Column(nullable = false) private String originalFileName;
    @Column(nullable = false, unique = true) private String storageKey;
    @Column(nullable = false) private String contentType;
    @Column(nullable = false) private long fileSize;
    @CreationTimestamp @Column(nullable = false, updatable = false) private Instant uploadedAt;
}
