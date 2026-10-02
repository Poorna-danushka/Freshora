package Freshora.Backend.application.entity;

import Freshora.Backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "store_applications",
    indexes = {
        @Index(name = "idx_store_application_status", columnList = "status"),
        @Index(name = "idx_store_application_email", columnList = "email")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "applicant_user_id")
    private User applicant;

    // Step 1: Applicant Information
    @Column(nullable = false, name = "applicant_name")
    private String applicantName;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false, name = "contact_number")
    private String contactNumber;

    @Column(name = "alternate_contact_number")
    private String alternateContactNumber;

    @Column(nullable = false, name = "preferred_contact_method")
    private String preferredContactMethod;

    @Column(length = 2000, name = "applicant_notes", columnDefinition = "TEXT")
    private String applicantNotes;

    // Step 2: Store Information
    @Column(nullable = false, name = "store_name")
    private String storeName;

    @Column(nullable = false, name = "store_contact_number")
    private String storeContactNumber;

    @Column(name = "store_email")
    private String storeEmail;

    @Column(nullable = false, length = 500, name = "store_address")
    private String storeAddress;

    @Column(nullable = false)
    private String city;

    @Column(name = "province")
    private String province;

    @Column(name = "postal_code")
    private String postalCode;

    @Column(name = "store_type")
    private String storeType;

    @Column(name = "registration_number")
    private String registrationNumber;

    @Column(name = "store_description", length = 4000, columnDefinition = "TEXT")
    private String storeDescription;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "store_logo_url", length = 500)
    private String storeLogoUrl;

    // Step 3: Business Documents
    @Column(name = "business_registration_number")
    private String businessRegistrationNumber;

    @Column(name = "business_registration_type")
    private String businessRegistrationType;

    @Column(name = "has_business_registration_document")
    private Boolean hasBusinessRegistrationDocument;

    @Column(name = "has_business_license")
    private Boolean hasBusinessLicense;

    @Column(name = "has_food_safety_certificate")
    private Boolean hasFoodSafetyCertificate;

    @Column(length = 4000, name = "additional_info", columnDefinition = "TEXT")
    private String additionalInfo;

    // Review Information
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.PENDING_REVIEW;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @Column(length = 4000, name = "review_notes", columnDefinition = "TEXT")
    private String reviewNotes;

    @CreationTimestamp
    @Column(nullable = false, updatable = false, name = "submitted_at")
    private Instant submittedAt;

    @UpdateTimestamp
    @Column(nullable = false, name = "updated_at")
    private Instant updatedAt;
}
