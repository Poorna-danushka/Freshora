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
import Freshora.Backend.exception.AuthenticationException;
import Freshora.Backend.exception.ConflictException;
import Freshora.Backend.exception.ResourceNotFoundException;
import Freshora.Backend.user.entity.AccountStatus;
import Freshora.Backend.user.entity.Role;
import Freshora.Backend.user.entity.RoleEntity;
import Freshora.Backend.user.entity.User;
import Freshora.Backend.user.repository.RoleRepository;
import Freshora.Backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DriverApplicationService {
    private final DriverApplicationRepository driverApplicationRepository;
    private final ApplicationDocumentRepository applicationDocumentRepository;
    private final ApplicationReviewHistoryRepository applicationReviewHistoryRepository;
    private final DocumentStorageService documentStorageService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

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
        requireRequiredDocuments(files, null);

        DriverApplication application = DriverApplication.builder()
                .applicant(currentUser)
                .fullName(request.fullName())
                .email(normalizedEmail)
                .contactNumber(request.contactNumber())
                .emergencyContactName(request.emergencyContactName())
                .emergencyContactNumber(request.emergencyContactNumber())
                .address(request.address())
                .city(request.city())
                .preferredContactMethod("email") // Default value since field doesn't exist in request
                .vehicleType(request.vehicleType())
                .vehicleRegistrationNumber(request.vehicleRegistrationNumber())
                .vehicleMake(request.vehicleMake())
                .vehicleModel(request.vehicleModel())
                .vehicleYear(parseYear(request.vehicleYear()))
                .vehicleColor(request.vehicleColor())
                .licenseNumber(request.licenseNumber() != null && !request.licenseNumber().isBlank() ? request.licenseNumber() : request.vehicleRegistrationNumber())
                .availability(request.preferredWorkingHours() != null && !request.preferredWorkingHours().isBlank() ? request.preferredWorkingHours() : "FULL_TIME")
                .preferredAreas(request.preferredArea())
                .hasDeliveryExperience(request.deliveryExperience() != null && !request.deliveryExperience().isBlank())
                .previousDeliveryExperience(request.deliveryExperience())
                .additionalInfo(request.additionalNotes())
                .status(ApplicationStatus.PENDING_REVIEW)
                .build();

        DriverApplication saved = driverApplicationRepository.save(application);

        saveDocuments(files, saved.getId());

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

    @Transactional
    public DriverApplicationResponse updateAndResubmit(
            User currentUser, UUID id, DriverApplicationRequest request, Map<String, MultipartFile> files) {
        if (currentUser == null || !currentUser.isEnabled()) {
            throw new AuthenticationException("Authentication required");
        }
        DriverApplication application = driverApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver application not found"));
        if (application.getApplicant() == null
                || !application.getApplicant().getId().equals(currentUser.getId())) {
            throw new AuthenticationException("Access denied");
        }
        if (application.getStatus() != ApplicationStatus.MORE_INFORMATION_REQUIRED) {
            throw new ConflictException("Only applications awaiting more information can be updated");
        }

        String normalizedEmail = currentUser.getEmail();
        Set<ApplicationStatus> blockingStatuses = Set.of(
                ApplicationStatus.PENDING_REVIEW,
                ApplicationStatus.APPROVED
        );
        if (driverApplicationRepository.existsByEmailAndStatusInAndIdNot(
                normalizedEmail, blockingStatuses, id)) {
            throw new ConflictException("A driver application is already in progress for this email");
        }
        requireRequiredDocuments(files, id);

        application.setFullName(request.fullName());
        application.setEmail(normalizedEmail);
        application.setContactNumber(request.contactNumber());
        application.setAddress(request.address());
        application.setCity(request.city());
        application.setEmergencyContactName(request.emergencyContactName());
        application.setEmergencyContactNumber(request.emergencyContactNumber());
        application.setVehicleType(request.vehicleType());
        application.setVehicleRegistrationNumber(request.vehicleRegistrationNumber());
        application.setVehicleMake(request.vehicleMake());
        application.setVehicleModel(request.vehicleModel());
        application.setVehicleYear(parseYear(request.vehicleYear()));
        application.setVehicleColor(request.vehicleColor());
        application.setLicenseNumber(request.licenseNumber() != null && !request.licenseNumber().isBlank() ? request.licenseNumber() : request.vehicleRegistrationNumber());
        if (request.preferredWorkingHours() != null && !request.preferredWorkingHours().isBlank()) {
            application.setAvailability(request.preferredWorkingHours());
        }
        application.setPreferredAreas(request.preferredArea());
        application.setHasDeliveryExperience(request.deliveryExperience() != null && !request.deliveryExperience().isBlank());
        application.setPreviousDeliveryExperience(request.deliveryExperience());
        application.setAdditionalInfo(request.additionalNotes());
        application.setStatus(ApplicationStatus.PENDING_REVIEW);
        application.setReviewedBy(null);
        application.setReviewedAt(null);
        application.setReviewNotes(null);
        driverApplicationRepository.save(application);
        saveDocuments(files, id);
        applicationReviewHistoryRepository.save(ApplicationReviewHistory.builder()
                .applicationType(ApplicationType.DRIVER)
                .applicationId(id)
                .previousStatus(ApplicationStatus.MORE_INFORMATION_REQUIRED)
                .newStatus(ApplicationStatus.PENDING_REVIEW)
                .note("Applicant updated and resubmitted requested information")
                .build());
        return toResponse(application);
    }

    public List<DriverApplicationResponse> getApplicationsForUser(User currentUser) {
        if (currentUser == null) throw new AuthenticationException("Authentication required");
        return driverApplicationRepository.findByApplicant_IdOrderBySubmittedAtDesc(currentUser.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    public DriverApplicationResponse getById(User currentUser, UUID id) {
        DriverApplication application = driverApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver application not found"));
        if (!currentUser.hasRole(Role.ADMIN) && (application.getApplicant() == null || !application.getApplicant().getId().equals(currentUser.getId()))) {
            throw new AuthenticationException("Access denied");
        }
        return toResponse(application);
    }

    public DriverApplicationResponse getByIdForAdmin(UUID id) {
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
    public MessageResponse reviewApplication(User reviewer, UUID id, ApplicationReviewActionRequest request) {
        if (reviewer == null || !reviewer.hasRole(Role.ADMIN)) {
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
        if ((targetStatus == ApplicationStatus.REJECTED
                || targetStatus == ApplicationStatus.MORE_INFORMATION_REQUIRED)
                && (request.note() == null || request.note().isBlank())) {
            throw new IllegalArgumentException("A review note is required for this action");
        }

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
            triggerApprovedAccountSetup(application.getEmail(), Role.DRIVER);
        }

        return new MessageResponse("Driver application " + targetStatus.name().toLowerCase(Locale.ROOT).replace('_', ' ') + " recorded");
    }

    private void triggerApprovedAccountSetup(String email, Role role) {
        String normalizedEmail = email == null ? null : email.trim().toLowerCase(Locale.ROOT);
        if (normalizedEmail == null || normalizedEmail.isBlank()) {
            return;
        }

        RoleEntity roleEntity = roleRepository.findByName(role)
                .orElseThrow(() -> new IllegalStateException("Role " + role + " not found in database"));

        User applicant = userRepository.findByEmail(normalizedEmail)
                .orElseGet(() -> {
                    Set<RoleEntity> roles = new HashSet<>();
                    roles.add(roleEntity);
                    return userRepository.save(User.builder()
                            .name("Freshora Applicant")
                            .email(normalizedEmail)
                            .phone("+00000000000") // Temporary phone, user must set on account setup
                            .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                            .roles(roles)
                            .status(AccountStatus.PENDING)
                            .build());
                });

        applicant.addRole(roleEntity);
        applicant.setStatus(AccountStatus.PENDING);
        if (applicant.getPassword() == null || applicant.getPassword().isBlank()) {
            applicant.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        }
        userRepository.save(applicant);

        // Note: Create account setup token and send email
        // String token = authService.createAccountSetupToken(applicant);
        // emailService.sendAccountSetupEmail(applicant.getEmail(), token);
        log.info("Driver application approved for: {}", applicant.getEmail());
    }

    private boolean containsSearchText(DriverApplication app, String searchText) {
        String query = searchText.toLowerCase(Locale.ROOT);
        return (app.getFullName() != null && app.getFullName().toLowerCase(Locale.ROOT).contains(query))
                || (app.getEmail() != null && app.getEmail().toLowerCase(Locale.ROOT).contains(query))
                || (app.getContactNumber() != null && app.getContactNumber().contains(query))
                || (app.getPreferredAreas() != null && app.getPreferredAreas().toLowerCase(Locale.ROOT).contains(query));
    }

    private void requireRequiredDocuments(Map<String, MultipartFile> files, UUID applicationId) {
        Set<String> required = Set.of(
                "photo", "vehicleRegistrationDoc", "identityDocument", "licenseFront");
        Set<String> available = applicationId == null
                ? Set.of()
                : applicationDocumentRepository
                        .findByApplicationTypeAndApplicationId(ApplicationType.DRIVER, applicationId)
                        .stream()
                        .map(doc -> doc.getDocumentType())
                        .collect(java.util.stream.Collectors.toSet());
        for (String documentType : required) {
            MultipartFile file = files == null ? null : files.get(documentType);
            if ((file == null || file.isEmpty()) && !available.contains(documentType)) {
                throw new IllegalArgumentException("Required application document is missing: " + documentType);
            }
        }
    }

    private void saveDocuments(Map<String, MultipartFile> files, UUID applicationId) {
        if (files == null) {
            return;
        }
        files.forEach((fieldName, file) -> {
            if (file != null && !file.isEmpty()) {
                ApplicationDocument stored = documentStorageService.saveUploadedFile(
                        file, ApplicationType.DRIVER, applicationId, fieldName, fieldName);
                applicationDocumentRepository.save(stored);
            }
        });
    }

    private DriverApplicationResponse toResponse(DriverApplication application) {
        // Note: Many fields from response DTO don't exist in entity
        // Mapping available entity fields to response DTO fields
        return new DriverApplicationResponse(
                String.valueOf(application.getId()),
                application.getFullName(),
                application.getEmail(),
                application.getContactNumber(),
                null, // dateOfBirth doesn't exist in entity
                application.getAddress(),
                application.getCity(),
                null, // province doesn't exist in entity
                application.getEmergencyContactName(),
                application.getEmergencyContactNumber(),
                application.getVehicleType(),
                application.getVehicleRegistrationNumber(),
                application.getVehicleMake(),
                application.getVehicleModel(),
                application.getVehicleYear() == null ? null : String.valueOf(application.getVehicleYear()),
                application.getVehicleColor(),
                null, // ownershipType doesn't exist in entity
                application.getPreferredAreas(),
                List.of(), // preferredWorkingDays doesn't exist in entity
                application.getAvailability(),
                application.getPreviousDeliveryExperience(),
                false, // hasSmartphone doesn't exist in entity
                null, // hasDeliveryBag doesn't exist in entity
                application.getAdditionalInfo(),
                toDocumentResponses(application.getId()),
                application.getStatus().name(),
                application.getSubmittedAt() == null ? null : application.getSubmittedAt().toString(),
                application.getUpdatedAt() == null ? null : application.getUpdatedAt().toString(),
                application.getReviewedBy() == null ? null : application.getReviewedBy().getEmail(),
                application.getReviewNotes(),
                toHistoryEntries(application.getId())
        );
    }

    private Integer parseYear(String yearStr) {
        if (yearStr == null || yearStr.isBlank()) return null;
        try {
            return Integer.valueOf(yearStr.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private List<ApplicationDocumentResponse> toDocumentResponses(UUID applicationId) {
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

    private List<ApplicationHistoryEntry> toHistoryEntries(UUID applicationId) {
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
