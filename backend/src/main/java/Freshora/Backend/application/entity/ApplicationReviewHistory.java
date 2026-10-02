package Freshora.Backend.application.entity;

import Freshora.Backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;

@Entity
@Table(name = "application_review_history", indexes = @Index(name = "idx_application_history_owner", columnList = "applicationType,applicationId"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApplicationReviewHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private java.util.UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "application_type", nullable = false)
    private ApplicationType applicationType;

    @Column(name = "application_id", nullable = false)
    private java.util.UUID applicationId;
    @Enumerated(EnumType.STRING) private ApplicationStatus previousStatus;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private ApplicationStatus newStatus;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "reviewed_by") private User reviewedBy;
    @Column(length = 4000, columnDefinition = "TEXT") private String note;
    @CreationTimestamp @Column(nullable = false, updatable = false) private Instant createdAt;
}
