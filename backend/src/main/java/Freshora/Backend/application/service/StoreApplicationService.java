package Freshora.Backend.application.service;

import Freshora.Backend.application.dto.ApplicationDocumentResponse;
import Freshora.Backend.application.dto.ApplicationHistoryEntry;
import Freshora.Backend.application.dto.ApplicationReviewActionRequest;
import Freshora.Backend.application.dto.StoreApplicationRequest;
import Freshora.Backend.application.dto.StoreApplicationResponse;
import Freshora.Backend.application.entity.ApplicationDocument;
import Freshora.Backend.application.entity.ApplicationReviewHistory;
import Freshora.Backend.application.entity.ApplicationStatus;
import Freshora.Backend.application.entity.ApplicationType;
import Freshora.Backend.application.entity.StoreApplication;
import Freshora.Backend.application.repository.ApplicationDocumentRepository;
import Freshora.Backend.application.repository.ApplicationReviewHistoryRepository;
import Freshora.Backend.application.repository.StoreApplicationRepository;
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
public class StoreApplicationService {
    private final StoreApplicationRepository storeApplicationRepository;
    private final ApplicationDocumentRepository applicationDocumentRepository;
    private final ApplicationReviewHistoryRepository applicationReviewHistoryRepository;
    private final DocumentStorageService documentStorageService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public StoreApplicationResponse submit(User currentUser, StoreApplicationRequest request, Map<String, MultipartFile> files) {
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
        if (storeApplicationRepository.existsByEmailAndStatusIn(normalizedEmail, blockingStatuses)) {
            throw new ConflictException("A store application is already in progress for this email");
        }
        requireRequiredDocuments(files, null);

        StoreApplication application = StoreApplication.builder()
                .applicant(currentUser)
                .applicantName(request.applicantName())
                .email(normalizedEmail)
                .contactNumber(request.contactNumber())
                .alternateContactNumber(request.alternateContactNumber())
                .preferredContactMethod(request.preferredContactMethod())
                .applicantNotes(request.applicantNotes())
                .storeName(request.storeName())
                .storeContactNumber(request.storeContactNumber())
                .storeEmail(request.storeEmail())
                .storeAddress(request.storeAddress())
                .city(request.city())
                // Note: province, postalCode, storeType, registrationNumber, storeDescription fields don't exist in entity
                // Using businessRegistrationNumber and additionalInfo instead
                .businessRegistrationNumber(request.registrationNumber())
                .additionalInfo(request.storeDescription())
                .status(ApplicationStatus.PENDING_REVIEW)
                .build();

        StoreApplication saved = storeApplicationRepository.save(application);

        saveDocuments(files, saved.getId());

        ApplicationReviewHistory history = ApplicationReviewHistory.builder()
                .applicationType(ApplicationType.STORE)
                .applicationId(saved.getId())
                .previousStatus(null)
                .newStatus(ApplicationStatus.PENDING_REVIEW)
                .note("Application submitted")
                .build();
        applicationReviewHistoryRepository.save(history);

        return toResponse(saved);
    }

    @Transactional
    public StoreApplicationResponse updateAndResubmit(
            User currentUser, UUID id, StoreApplicationRequest request, Map<String, MultipartFile> files) {
        if (currentUser == null || !currentUser.isEnabled()) {
            throw new AuthenticationException("Authentication required");
        }
        StoreApplication application = storeApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store application not found"));
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
        if (storeApplicationRepository.existsByEmailAndStatusInAndIdNot(
                normalizedEmail, blockingStatuses, id)) {
            throw new ConflictException("A store application is already in progress for this email");
        }
        requireRequiredDocuments(files, id);

        application.setApplicantName(request.applicantName());
        application.setEmail(normalizedEmail);
        application.setContactNumber(request.contactNumber());
        application.setAlternateContactNumber(request.alternateContactNumber());
        application.setPreferredContactMethod(request.preferredContactMethod());
        application.setApplicantNotes(request.applicantNotes());
        application.setStoreName(request.storeName());
        application.setStoreContactNumber(request.storeContactNumber());
        application.setStoreEmail(request.storeEmail());
        application.setStoreAddress(request.storeAddress());
        application.setCity(request.city());
        // Note: province, postalCode, storeType fields don't exist in entity
        application.setBusinessRegistrationNumber(request.registrationNumber());
        application.setAdditionalInfo(request.storeDescription());
        application.setStatus(ApplicationStatus.PENDING_REVIEW);
        application.setReviewedBy(null);
        application.setReviewedAt(null);
        application.setReviewNotes(null);
        storeApplicationRepository.save(application);
        saveDocuments(files, id);
        applicationReviewHistoryRepository.save(ApplicationReviewHistory.builder()
                .applicationType(ApplicationType.STORE)
                .applicationId(id)
                .previousStatus(ApplicationStatus.MORE_INFORMATION_REQUIRED)
                .newStatus(ApplicationStatus.PENDING_REVIEW)
                .note("Applicant updated and resubmitted requested information")
                .build());
        return toResponse(application);
    }

    public List<StoreApplicationResponse> getApplicationsForUser(User currentUser) {
        if (currentUser == null) throw new AuthenticationException("Authentication required");
        return storeApplicationRepository.findByApplicant_IdOrderBySubmittedAtDesc(currentUser.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    public StoreApplicationResponse getById(User currentUser, UUID id) {
        StoreApplication application = storeApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store application not found"));
        if (!currentUser.hasRole(Role.ADMIN) && (application.getApplicant() == null || !application.getApplicant().getId().equals(currentUser.getId()))) {
            throw new AuthenticationException("Access denied");
        }
        return toResponse(application);
    }

    public StoreApplicationResponse getByIdForAdmin(UUID id) {
        StoreApplication application = storeApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store application not found"));
        return toResponse(application);
    }

    public List<StoreApplicationResponse> listApplications(String statusFilter, String searchText) {
        List<StoreApplication> applications = storeApplicationRepository.findAll();
        List<StoreApplication> filtered = new ArrayList<>();
        for (StoreApplication app : applications) {
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

        StoreApplication application = storeApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store application not found"));

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
        storeApplicationRepository.save(application);

        ApplicationReviewHistory history = ApplicationReviewHistory.builder()
                .applicationType(ApplicationType.STORE)
                .applicationId(application.getId())
                .previousStatus(previousStatus)
                .newStatus(targetStatus)
                .reviewedBy(reviewer)
                .note(request.note())
                .build();
        applicationReviewHistoryRepository.save(history);

        if (targetStatus == ApplicationStatus.APPROVED) {
            triggerApprovedAccountSetup(application.getEmail(), Role.STORE_MANAGER);
        }

        return new MessageResponse("Store application " + targetStatus.name().toLowerCase(Locale.ROOT).replace('_', ' ') + " recorded");
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
        log.info("Store application approved for: {}", applicant.getEmail());
    }

    private boolean containsSearchText(StoreApplication app, String searchText) {
        String query = searchText.toLowerCase(Locale.ROOT);
        return (app.getStoreName() != null && app.getStoreName().toLowerCase(Locale.ROOT).contains(query))
                || (app.getApplicantName() != null && app.getApplicantName().toLowerCase(Locale.ROOT).contains(query))
                || (app.getEmail() != null && app.getEmail().toLowerCase(Locale.ROOT).contains(query))
                || (app.getContactNumber() != null && app.getContactNumber().contains(query));
    }

    private void requireRequiredDocuments(Map<String, MultipartFile> files, UUID applicationId) {
        Set<String> required = Set.of("logo", "businessRegistration", "identityDocument");
        Set<String> available = applicationId == null
                ? Set.of()
                : applicationDocumentRepository
                        .findByApplicationTypeAndApplicationId(ApplicationType.STORE, applicationId)
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
                        file, ApplicationType.STORE, applicationId, fieldName, fieldName);
                applicationDocumentRepository.save(stored);
            }
        });
    }

    private StoreApplicationResponse toResponse(StoreApplication application) {
        return new StoreApplicationResponse(
                String.valueOf(application.getId()),
                application.getApplicantName(),
                application.getEmail(),
                application.getContactNumber(),
                application.getAlternateContactNumber(),
                application.getPreferredContactMethod(),
                application.getApplicantNotes(),
                application.getStoreContactNumber(),
                application.getStoreEmail(),
                application.getStoreName(),
                application.getStoreAddress(),
                application.getCity(),
                application.getProvince(),
                application.getPostalCode(),
                application.getStoreType(),
                application.getRegistrationNumber(),
                application.getStoreDescription(),
                toDocumentResponses(application.getId()),
                application.getStatus().name(),
                application.getSubmittedAt() == null ? null : application.getSubmittedAt().toString(),
                application.getUpdatedAt() == null ? null : application.getUpdatedAt().toString(),
                application.getReviewedBy() == null ? null : application.getReviewedBy().getEmail(),
                application.getReviewNotes(),
                toHistoryEntries(application.getId())
        );
    }

    private List<ApplicationDocumentResponse> toDocumentResponses(UUID applicationId) {
        return applicationDocumentRepository.findByApplicationTypeAndApplicationId(ApplicationType.STORE, applicationId).stream()
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
        return applicationReviewHistoryRepository.findByApplicationTypeAndApplicationIdOrderByCreatedAtAsc(ApplicationType.STORE, applicationId)
                .stream()
                .map(entry -> new ApplicationHistoryEntry(
                        entry.getCreatedAt() == null ? null : entry.getCreatedAt().toString(),
                        entry.getNewStatus() == null ? null : entry.getNewStatus().name(),
                        entry.getReviewedBy() == null ? null : entry.getReviewedBy().getEmail(),
                        entry.getNote()))
                .toList();
    }
}
