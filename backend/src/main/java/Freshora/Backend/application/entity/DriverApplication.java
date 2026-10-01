package Freshora.Backend.application.entity;

import Freshora.Backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.Instant;

@Entity
@Table(name = "driver_applications", indexes = {@Index(name = "idx_driver_application_status", columnList = "status"), @Index(name = "idx_driver_application_email", columnList = "email")})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DriverApplication {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "applicant_user_id") private User applicant;
    @Column(nullable = false) private String fullName;
    @Column(nullable = false) private String email;
    @Column(nullable = false) private String contactNumber;
    @Column(nullable = false) private String dateOfBirth;
    @Column(nullable = false, length = 1000) private String address;
    @Column(nullable = false) private String city;
    private String province;
    private String emergencyContactName;
    private String emergencyContactNumber;
    @Column(nullable = false) private String vehicleType;
    @Column(nullable = false) private String vehicleRegistrationNumber;
    private String vehicleMake;
    private String vehicleModel;
    private String vehicleYear;
    private String vehicleColor;
    @Column(nullable = false) private String ownershipType;
    @Column(nullable = false) private String preferredArea;
    @Column(length = 1000) private String preferredWorkingDays;
    private String preferredWorkingHours;
    @Column(length = 2000) private String deliveryExperience;
    @Column(nullable = false) private boolean hasSmartphone;
    private Boolean hasDeliveryBag;
    @Column(length = 2000) private String additionalNotes;
    @Enumerated(EnumType.STRING) @Column(nullable = false) @Builder.Default private ApplicationStatus status = ApplicationStatus.PENDING_REVIEW;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "reviewed_by") private User reviewedBy;
    private Instant reviewedAt;
    @Column(length = 4000) private String reviewNotes;
    @CreationTimestamp @Column(nullable = false, updatable = false) private Instant submittedAt;
    @UpdateTimestamp @Column(nullable = false) private Instant updatedAt;
}
