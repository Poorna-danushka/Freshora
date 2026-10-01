package Freshora.Backend.application.entity;

import Freshora.Backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.Instant;

@Entity
@Table(name = "store_applications", indexes = {@Index(name = "idx_store_application_status", columnList = "status"), @Index(name = "idx_store_application_email", columnList = "email")})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StoreApplication {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "applicant_user_id") private User applicant;
    @Column(nullable = false) private String applicantName;
    @Column(nullable = false) private String email;
    @Column(nullable = false) private String contactNumber;
    private String alternateContactNumber;
    @Column(nullable = false) private String preferredContactMethod;
    @Column(length = 2000) private String applicantNotes;
    @Column(nullable = false) private String storeName;
    @Column(nullable = false) private String storeContactNumber;
    private String storeEmail;
    @Column(nullable = false, length = 1000) private String storeAddress;
    @Column(nullable = false) private String city;
    private String province;
    private String postalCode;
    @Column(nullable = false) private String storeType;
    private String registrationNumber;
    @Column(length = 4000) private String storeDescription;
    @Enumerated(EnumType.STRING) @Column(nullable = false) @Builder.Default private ApplicationStatus status = ApplicationStatus.PENDING_REVIEW;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "reviewed_by") private User reviewedBy;
    private Instant reviewedAt;
    @Column(length = 4000) private String reviewNotes;
    @CreationTimestamp @Column(nullable = false, updatable = false) private Instant submittedAt;
    @UpdateTimestamp @Column(nullable = false) private Instant updatedAt;
}
