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
public class StoreApplicationService {
    private final StoreApplicationRepository storeApplicationRepository;
    private final ApplicationDocumentRepository applicationDocumentRepository;
    private final ApplicationReviewHistoryRepository applicationReviewHistoryRepository;
    private final DocumentStorageService documentStorageService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;
    private final EmailService emailService;

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
                .province(request.province())
                .postalCode(request.postalCode())
                .storeType(request.storeType())
                .registrationNumber(request.registrationNumber())
                .storeDescription(request.storeDescription())
                .status(ApplicationStatus.PENDING_REVIEW)
                .build();

        StoreApplication saved = storeApplicationRepository.save(application);

        if (files != null) {
            files.forEach((fieldName, file) -> {
                if (file != null && !file.isEmpty()) {
                    ApplicationDocument stored = documentStorageService.saveUploadedFile(file, ApplicationType.STORE, saved.getId(), fieldName, fieldName);
                    applicationDocumentRepository.save(stored);
                }
            });
        }

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

    public List<StoreApplicationResponse> getApplicationsForUser(User currentUser) {
        if (currentUser == null) throw new AuthenticationException("Authentication required");
        return storeApplicationRepository.findAll().stream()
                .filter(application -> application.getApplicant() != null && application.getApplicant().getId().equals(currentUser.getId()))
                .sorted((a, b) -> b.getSubmittedAt().compareTo(a.getSubmittedAt()))
                .map(this::toResponse)
                .toList();
    }

    public StoreApplicationResponse getById(User currentUser, Long id) {
        StoreApplication application = storeApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store application not found"));
        if (currentUser.getRole() != Role.ADMIN && (application.getApplicant() == null || !application.getApplicant().getId().equals(currentUser.getId()))) {
            throw new AuthenticationException("Access denied");
        }
        return toResponse(application);
    }

    public StoreApplicationResponse getByIdForAdmin(Long id) {
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
    public MessageResponse reviewApplication(User reviewer, Long id, ApplicationReviewActionRequest request) {
        if (reviewer == null || reviewer.getRole() != Role.ADMIN) {
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

    private boolean containsSearchText(StoreApplication app, String searchText) {
        String query = searchText.toLowerCase(Locale.ROOT);
        return (app.getStoreName() != null && app.getStoreName().toLowerCase(Locale.ROOT).contains(query))
                || (app.getApplicantName() != null && app.getApplicantName().toLowerCase(Locale.ROOT).contains(query))
                || (app.getEmail() != null && app.getEmail().toLowerCase(Locale.ROOT).contains(query))
                || (app.getContactNumber() != null && app.getContactNumber().contains(query));
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

    private List<ApplicationDocumentResponse> toDocumentResponses(Long applicationId) {
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

    private List<ApplicationHistoryEntry> toHistoryEntries(Long applicationId) {
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
