package Freshora.Backend.application.service;

import Freshora.Backend.application.dto.ApplicationDocumentResponse;
import Freshora.Backend.application.dto.ApplicationHistoryEntry;
import Freshora.Backend.application.dto.ApplicationReviewActionRequest;
import Freshora.Backend.application.dto.DriverApplicationRequest;
import Freshora.Backend.application.dto.DriverApplicationResponse;
import Freshora.Backend.application.entity.ApplicationDocument;
import Freshora.Backend.application.entity.ApplicationReviewHistory;
import Freshora.Backend.application.entity.ApplicationStatus;
import Freshora.Backend.application.entity.ApplicationType;
import Freshora.Backend.application.entity.DriverApplication;
import Freshora.Backend.application.repository.ApplicationDocumentRepository;
import Freshora.Backend.application.repository.ApplicationReviewHistoryRepository;
import Freshora.Backend.application.repository.DriverApplicationRepository;
import Freshora.Backend.auth.dto.MessageResponse;
import Freshora.Backend.auth.service.AuthService;
import Freshora.Backend.auth.service.EmailService;
import Freshora.Backend.exception.AuthenticationException;
import Freshora.Backend.exception.ConflictException;
import Freshora.Backend.exception.ResourceNotFoundException;
import Freshora.Backend.user.entity.AccountStatus;
import Freshora.Backend.user.entity.Role;
import Freshora.Backend.user.entity.User;
import Freshora.Backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DriverApplicationService {
    private final DriverApplicationRepository driverApplicationRepository;
    private final ApplicationDocumentRepository applicationDocumentRepository;
    private final ApplicationReviewHistoryRepository applicationReviewHistoryRepository;
    private final DocumentStorageService documentStorageService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;
    private final EmailService emailService;

    @Transactional
    public DriverApplicationResponse submit(User currentUser, DriverApplicationRequest request, Map<String, MultipartFile> files) {
        if (currentUser == null) {
            throw new AuthenticationException("Authentication required");
        }
        if (!currentUser.isEnabled()) {
            throw new AuthenticationException("User account is not active");
        }

        String normalizedEmail = currentUser.getEmail() == null ? request.email() : currentUser.getEmail();
        Set<ApplicationStatus> blockingStatuses = Set.of(
                ApplicationStatus.PENDING_REVIEW,
                ApplicationStatus.MORE_INFORMATION_REQUIRED,
                ApplicationStatus.APPROVED
        );
        if (driverApplicationRepository.existsByEmailAndStatusIn(normalizedEmail, blockingStatuses)) {
            throw new ConflictException("A driver application is already in progress for this email");
        }

        DriverApplication application = DriverApplication.builder()
                .applicant(currentUser)
                .fullName(request.fullName())
                .email(normalizedEmail)
                .contactNumber(request.contactNumber())
                .dateOfBirth(request.dateOfBirth())
                .address(request.address())
                .city(request.city())
                .province(request.province())
                .emergencyContactName(request.emergencyContactName())
                .emergencyContactNumber(request.emergencyContactNumber())
                .vehicleType(request.vehicleType())
                .vehicleRegistrationNumber(request.vehicleRegistrationNumber())
                .vehicleMake(request.vehicleMake())
                .vehicleModel(request.vehicleModel())
                .vehicleYear(request.vehicleYear())
                .vehicleColor(request.vehicleColor())
                .ownershipType(request.ownershipType())
                .preferredArea(request.preferredArea())
                .preferredWorkingDays(request.preferredWorkingDays())
                .preferredWorkingHours(request.preferredWorkingHours())
                .deliveryExperience(request.deliveryExperience())
                .hasSmartphone(request.hasSmartphone())
                .hasDeliveryBag(request.hasDeliveryBag())
                .additionalNotes(request.additionalNotes())
                .status(ApplicationStatus.PENDING_REVIEW)
                .build();

        DriverApplication saved = driverApplicationRepository.save(application);

        if (files != null) {
            files.forEach((fieldName, file) -> {
                if (file != null && !file.isEmpty()) {
                    ApplicationDocument stored = documentStorageService.saveUploadedFile(file, ApplicationType.DRIVER, saved.getId(), fieldName, fieldName);
                    applicationDocumentRepository.save(stored);
                }
            });
        }

        ApplicationReviewHistory history = ApplicationReviewHistory.builder()
                .applicationType(ApplicationType.DRIVER)
                .applicationId(saved.getId())
                .previousStatus(null)
                .newStatus(ApplicationStatus.PENDING_REVIEW)
                .note("Application submitted")
                .build();
        applicationReviewHistoryRepository.save(history);

        return toResponse(saved);
    }

    public List<DriverApplicationResponse> getApplicationsForUser(User currentUser) {
        if (currentUser == null) throw new AuthenticationException("Authentication required");
        return driverApplicationRepository.findAll().stream()
                .filter(application -> application.getApplicant() != null && application.getApplicant().getId().equals(currentUser.getId()))
                .sorted((a, b) -> b.getSubmittedAt().compareTo(a.getSubmittedAt()))
                .map(this::toResponse)
                .toList();
    }

    public DriverApplicationResponse getById(User currentUser, Long id) {
        DriverApplication application = driverApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver application not found"));
        if (currentUser.getRole() != Role.ADMIN && (application.getApplicant() == null || !application.getApplicant().getId().equals(currentUser.getId()))) {
            throw new AuthenticationException("Access denied");
        }
        return toResponse(application);
    }

    public DriverApplicationResponse getByIdForAdmin(Long id) {
        DriverApplication application = driverApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver application not found"));
        return toResponse(application);
    }

    public List<DriverApplicationResponse> listApplications(String statusFilter, String searchText) {
        List<DriverApplication> applications = driverApplicationRepository.findAll();
        List<DriverApplication> filtered = new ArrayList<>();
        for (DriverApplication app : applications) {
            boolean matchStatus = statusFilter == null || statusFilter.isBlank() || app.getStatus().name().equalsIgnoreCase(statusFilter);
            boolean matchSearch = searchText == null || searchText.isBlank() || containsSearchText(app, searchText);
            if (matchStatus && matchSearch) {
                filtered.add(app);
            }
        }
        filtered.sort((a, b) -> b.getSubmittedAt().compareTo(a.getSubmittedAt()));
        return filtered.stream().map(this::toResponse).toList();
    }

    @Transactional
    public MessageResponse reviewApplication(User reviewer, Long id, ApplicationReviewActionRequest request) {
        if (reviewer == null || reviewer.getRole() != Role.ADMIN) {
            throw new AuthenticationException("Admin access required");
        }
        if (request == null || request.action() == null || request.action().isBlank()) {
            throw new IllegalArgumentException("Review action is required");
        }

        DriverApplication application = driverApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver application not found"));

        ApplicationStatus targetStatus = switch (request.action().toUpperCase(Locale.ROOT)) {
            case "APPROVE" -> ApplicationStatus.APPROVED;
            case "REJECT" -> ApplicationStatus.REJECTED;
            case "REQUEST_MORE_INFO" -> ApplicationStatus.MORE_INFORMATION_REQUIRED;
            default -> throw new IllegalArgumentException("Unsupported review action");
        };

        if (application.getStatus() == ApplicationStatus.APPROVED || application.getStatus() == ApplicationStatus.REJECTED) {
            throw new ConflictException("This application has already been reviewed");
        }

        ApplicationStatus previousStatus = application.getStatus();
        application.setStatus(targetStatus);
        application.setReviewedBy(reviewer);
        application.setReviewedAt(Instant.now());
        application.setReviewNotes(request.note());
        driverApplicationRepository.save(application);

        ApplicationReviewHistory history = ApplicationReviewHistory.builder()
                .applicationType(ApplicationType.DRIVER)
                .applicationId(application.getId())
                .previousStatus(previousStatus)
                .newStatus(targetStatus)
                .reviewedBy(reviewer)
                .note(request.note())
                .build();
        applicationReviewHistoryRepository.save(history);

        if (targetStatus == ApplicationStatus.APPROVED) {
            triggerApprovedAccountSetup(application.getEmail(), Role.DELIVERY_RIDER);
        }

        return new MessageResponse("Driver application " + targetStatus.name().toLowerCase(Locale.ROOT).replace('_', ' ') + " recorded");
    }

    private void triggerApprovedAccountSetup(String email, Role role) {
        String normalizedEmail = email == null ? null : email.trim().toLowerCase(Locale.ROOT);
        if (normalizedEmail == null || normalizedEmail.isBlank()) {
            return;
        }

        User applicant = userRepository.findByEmail(normalizedEmail)
                .orElseGet(() -> userRepository.save(User.builder()
                        .firstName("Freshora")
                        .lastName("Applicant")
                        .email(normalizedEmail)
                        .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                        .role(role)
                        .status(AccountStatus.PENDING)
                        .enabled(false)
                        .build()));

        applicant.setRole(role);
        applicant.setStatus(AccountStatus.PENDING);
        applicant.setEnabled(false);
        if (applicant.getPassword() == null || applicant.getPassword().isBlank()) {
            applicant.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        }
        userRepository.save(applicant);

        String token = authService.createAccountSetupToken(applicant);
        emailService.sendAccountSetupEmail(applicant.getEmail(), token);
    }

    private boolean containsSearchText(DriverApplication app, String searchText) {
        String query = searchText.toLowerCase(Locale.ROOT);
        return (app.getFullName() != null && app.getFullName().toLowerCase(Locale.ROOT).contains(query))
                || (app.getEmail() != null && app.getEmail().toLowerCase(Locale.ROOT).contains(query))
                || (app.getContactNumber() != null && app.getContactNumber().contains(query))
                || (app.getPreferredArea() != null && app.getPreferredArea().toLowerCase(Locale.ROOT).contains(query));
    }

    private DriverApplicationResponse toResponse(DriverApplication application) {
        return new DriverApplicationResponse(
                String.valueOf(application.getId()),
                application.getFullName(),
                application.getEmail(),
                application.getContactNumber(),
                application.getDateOfBirth(),
                application.getAddress(),
                application.getCity(),
                application.getProvince(),
                application.getEmergencyContactName(),
                application.getEmergencyContactNumber(),
                application.getVehicleType(),
                application.getVehicleRegistrationNumber(),
                application.getVehicleMake(),
                application.getVehicleModel(),
                application.getVehicleYear(),
                application.getVehicleColor(),
                application.getOwnershipType(),
                application.getPreferredArea(),
                application.getPreferredWorkingDays() == null ? List.of() : List.of(application.getPreferredWorkingDays().split(",")),
                application.getPreferredWorkingHours(),
                application.getDeliveryExperience(),
                application.isHasSmartphone(),
                application.getHasDeliveryBag(),
                application.getAdditionalNotes(),
                toDocumentResponses(application.getId()),
                application.getStatus().name(),
                application.getSubmittedAt() == null ? null : application.getSubmittedAt().toString(),
                application.getUpdatedAt() == null ? null : application.getUpdatedAt().toString(),
                application.getReviewedBy() == null ? null : application.getReviewedBy().getEmail(),
                application.getReviewNotes(),
                toHistoryEntries(application.getId())
        );
    }

    private List<ApplicationDocumentResponse> toDocumentResponses(Long applicationId) {
        return applicationDocumentRepository.findByApplicationTypeAndApplicationId(ApplicationType.DRIVER, applicationId).stream()
                .map(document -> new ApplicationDocumentResponse(
                        String.valueOf(document.getId()),
                        document.getDocumentType(),
                        document.getDocumentType(),
                        true,
                        document.getOriginalFileName(),
                        document.getContentType(),
                        document.getFileSize(),
                        document.getUploadedAt() == null ? null : document.getUploadedAt().toString()))
                .toList();
    }

    private List<ApplicationHistoryEntry> toHistoryEntries(Long applicationId) {
        return applicationReviewHistoryRepository.findByApplicationTypeAndApplicationIdOrderByCreatedAtAsc(ApplicationType.DRIVER, applicationId)
                .stream()
                .map(entry -> new ApplicationHistoryEntry(
                        entry.getCreatedAt() == null ? null : entry.getCreatedAt().toString(),
                        entry.getNewStatus() == null ? null : entry.getNewStatus().name(),
                        entry.getReviewedBy() == null ? null : entry.getReviewedBy().getEmail(),
                        entry.getNote()))
                .toList();
    }
}
