package Freshora.Backend.auth.service;

import Freshora.Backend.application.entity.DriverApplication;
import Freshora.Backend.application.entity.StoreApplication;
import Freshora.Backend.application.repository.DriverApplicationRepository;
import Freshora.Backend.application.repository.StoreApplicationRepository;
import Freshora.Backend.auth.dto.*;
import Freshora.Backend.exception.ConflictException;
import Freshora.Backend.user.entity.AccountStatus;
import Freshora.Backend.user.entity.Role;
import Freshora.Backend.user.entity.RoleEntity;
import Freshora.Backend.user.entity.User;
import Freshora.Backend.user.repository.RoleRepository;
import Freshora.Backend.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

/**
 * Service handling user registration for different user types:
 * - Customer (simple signup, immediately active)
 * - Store Partner (application flow, pending approval)
 * - Driver (application flow, pending approval)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RegistrationService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final StoreApplicationRepository storeApplicationRepository;
    private final DriverApplicationRepository driverApplicationRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    /**
     * Register a new customer account
     * - Creates account immediately with CUSTOMER role
     * - Account is ACTIVE and can log in right away
     * - Returns authentication tokens
     */
    @Transactional
    public AuthResponse registerCustomer(CustomerRegisterRequest request, HttpServletResponse response) {
        String normalizedEmail = normalizeEmail(request.email());
        String normalizedPhone = normalizePhone(request.phone());

        validateEmailNotExists(normalizedEmail);
        validatePhoneNotExists(normalizedPhone);

        RoleEntity customerRole = getOrCreateRole(Role.CUSTOMER);

        User user = User.builder()
                .name(request.name().trim())
                .email(normalizedEmail)
                .phone(normalizedPhone)
                .password(passwordEncoder.encode(request.password()))
                .status(AccountStatus.ACTIVE)
                .roles(new HashSet<>(Set.of(customerRole)))
                .build();

        User savedUser = userRepository.save(user);
        log.info("Customer registered successfully: {}", savedUser.getEmail());

        // Issue authentication tokens
        return tokenService.issueAuthenticationTokens(savedUser, response);
    }

    /**
     * Submit store partner application
     * - Creates account with PENDING status
     * - Saves application data for admin review
     * - User cannot log in until approved
     * - Does NOT issue authentication tokens
     */
    @Transactional
    public ApplicationSubmittedResponse applyAsStorePartner(StorePartnerApplicationRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        String normalizedPhone = normalizePhone(request.personalContactNumber());

        validateEmailNotExists(normalizedEmail);
        validatePhoneNotExists(normalizedPhone);

        // Create pending user account (cannot log in yet)
        User user = User.builder()
                .name(request.fullName().trim())
                .email(normalizedEmail)
                .phone(normalizedPhone)
                .password(passwordEncoder.encode(request.password()))
                .status(AccountStatus.PENDING)
                .roles(new HashSet<>()) // No roles yet - will be assigned upon approval
                .build();

        User savedUser = userRepository.save(user);

        // Create store application
        StoreApplication application = StoreApplication.builder()
                .applicant(savedUser)
                .applicantName(request.fullName().trim())
                .email(normalizedEmail)
                .contactNumber(normalizedPhone)
                .alternateContactNumber(request.alternateContactNumber())
                .preferredContactMethod(request.preferredContactMethod())
                .applicantNotes(request.notes())
                .storeName(request.storeName().trim())
                .storeContactNumber(request.storeContactNumber())
                .storeAddress(request.storeAddress())
                .city(request.city())
                .latitude(request.latitude())
                .longitude(request.longitude())
                .storeLogoUrl(request.storeLogoUrl())
                .businessRegistrationNumber(request.businessRegistrationNumber())
                .businessRegistrationType(request.businessRegistrationType())
                .hasBusinessRegistrationDocument(request.hasBusinessRegistrationDocument())
                .hasBusinessLicense(request.hasBusinessLicense())
                .hasFoodSafetyCertificate(request.hasFoodSafetyCertificate())
                .additionalInfo(request.additionalInfo())
                .build();

        StoreApplication savedApplication = storeApplicationRepository.save(application);
        log.info("Store partner application submitted: {} - {}", savedUser.getEmail(), savedApplication.getId());

        // Note: Send confirmation email
        // Note: Notify admins of new application

        return ApplicationSubmittedResponse.forStoreApplication(savedApplication.getId(), normalizedEmail);
    }

    /**
     * Submit driver application
     * - Creates account with PENDING status
     * - Saves application data for admin review
     * - User cannot log in until approved
     * - Does NOT issue authentication tokens
     */
    @Transactional
    public ApplicationSubmittedResponse applyAsDriver(DriverApplicationRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        String normalizedPhone = normalizePhone(request.contactNumber());

        validateEmailNotExists(normalizedEmail);
        validatePhoneNotExists(normalizedPhone);

        // Create pending user account (cannot log in yet)
        User user = User.builder()
                .name(request.fullName().trim())
                .email(normalizedEmail)
                .phone(normalizedPhone)
                .password(passwordEncoder.encode(request.password()))
                .status(AccountStatus.PENDING)
                .roles(new HashSet<>()) // No roles yet - will be assigned upon approval
                .build();

        User savedUser = userRepository.save(user);

        // Create driver application
        DriverApplication application = DriverApplication.builder()
                .applicant(savedUser)
                .fullName(request.fullName().trim())
                .email(normalizedEmail)
                .contactNumber(normalizedPhone)
                .emergencyContactNumber(request.emergencyContactNumber())
                .emergencyContactName(request.emergencyContactName())
                .address(request.address())
                .city(request.city())
                .preferredContactMethod(request.preferredContactMethod())
                .notes(request.notes())
                .vehicleType(request.vehicleType())
                .vehicleMake(request.vehicleMake())
                .vehicleModel(request.vehicleModel())
                .vehicleYear(request.vehicleYear())
                .vehicleRegistrationNumber(request.vehicleRegistrationNumber())
                .vehicleColor(request.vehicleColor())
                .licenseNumber(request.licenseNumber())
                .licenseIssuingAuthority(request.licenseIssuingAuthority())
                .licenseExpiryDate(request.licenseExpiryDate())
                .hasDriversLicense(request.hasDriversLicense())
                .hasVehicleRegistration(request.hasVehicleRegistration())
                .hasInsuranceDocument(request.hasInsuranceDocument())
                .hasProfilePhoto(request.hasProfilePhoto())
                .hasVehiclePhoto(request.hasVehiclePhoto())
                .hasDeliveryExperience(request.hasDeliveryExperience())
                .previousDeliveryExperience(request.previousDeliveryExperience())
                .availability(request.availability())
                .preferredAreas(request.preferredAreas())
                .agreedToTerms(request.agreedToTerms())
                .additionalInfo(request.additionalInfo())
                .build();

        DriverApplication savedApplication = driverApplicationRepository.save(application);
        log.info("Driver application submitted: {} - {}", savedUser.getEmail(), savedApplication.getId());

        // Note: Send confirmation email
        // Note: Notify admins of new application

        return ApplicationSubmittedResponse.forDriverApplication(savedApplication.getId(), normalizedEmail);
    }

    /**
     * Get or create a role entity
     */
    private RoleEntity getOrCreateRole(Role role) {
        return roleRepository.findByName(role)
                .orElseGet(() -> {
                    RoleEntity newRole = new RoleEntity(role);
                    return roleRepository.save(newRole);
                });
    }

    /**
     * Validate email doesn't already exist
     */
    private void validateEmailNotExists(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("An account with this email already exists");
        }
    }

    /**
     * Validate phone doesn't already exist
     */
    private void validatePhoneNotExists(String phone) {
        if (userRepository.existsByPhone(phone)) {
            throw new ConflictException("An account with this phone number already exists");
        }
    }

    /**
     * Normalize email to lowercase and trim
     */
    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    /**
     * Normalize phone number (remove spaces, dashes)
     */
    private String normalizePhone(String phone) {
        return phone.trim().replaceAll("[\\s-]", "");
    }
}
