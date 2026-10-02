package Freshora.Backend.application.entity;

import Freshora.Backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "driver_applications",
    indexes = {
        @Index(name = "idx_driver_application_status", columnList = "status"),
        @Index(name = "idx_driver_application_email", columnList = "email")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "applicant_user_id")
    private User applicant;

    // Step 1: Personal Information
    @Column(nullable = false, name = "full_name")
    private String fullName;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false, name = "contact_number")
    private String contactNumber;

    @Column(name = "emergency_contact_number")
    private String emergencyContactNumber;

    @Column(name = "emergency_contact_name")
    private String emergencyContactName;

    @Column(nullable = false, length = 500)
    private String address;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false, name = "preferred_contact_method")
    private String preferredContactMethod;

    @Column(length = 2000, columnDefinition = "TEXT")
    private String notes;

    // Step 2: Vehicle Information
    @Column(nullable = false, name = "vehicle_type")
    private String vehicleType;

    @Column(name = "vehicle_make")
    private String vehicleMake;

    @Column(name = "vehicle_model")
    private String vehicleModel;

    @Column(name = "vehicle_year")
    private Integer vehicleYear;

    @Column(nullable = false, name = "vehicle_registration_number")
    private String vehicleRegistrationNumber;

    @Column(name = "vehicle_color")
    private String vehicleColor;

    // Step 3: License & Documents
    @Column(nullable = false, name = "license_number")
    private String licenseNumber;

    @Column(name = "license_issuing_authority")
    private String licenseIssuingAuthority;

    @Column(name = "license_expiry_date")
    private String licenseExpiryDate;

    @Column(name = "has_drivers_license")
    private Boolean hasDriversLicense;

    @Column(name = "has_vehicle_registration")
    private Boolean hasVehicleRegistration;

    @Column(name = "has_insurance_document")
    private Boolean hasInsuranceDocument;

    @Column(name = "has_profile_photo")
    private Boolean hasProfilePhoto;

    @Column(name = "has_vehicle_photo")
    private Boolean hasVehiclePhoto;

    // Step 4: Background & Availability
    @Column(name = "has_delivery_experience")
    private Boolean hasDeliveryExperience;

    @Column(length = 2000, name = "previous_delivery_experience", columnDefinition = "TEXT")
    private String previousDeliveryExperience;

    @Builder.Default
    @Column(nullable = false)
    private String availability = "FULL_TIME";

    @Column(length = 500, name = "preferred_areas")
    private String preferredAreas;

    @Column(name = "agreed_to_terms")
    private Boolean agreedToTerms;

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
