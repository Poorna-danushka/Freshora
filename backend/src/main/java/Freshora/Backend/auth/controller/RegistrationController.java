package Freshora.Backend.auth.controller;

import Freshora.Backend.auth.dto.*;
import Freshora.Backend.auth.service.RegistrationService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for user registration endpoints
 * Handles three separate registration flows:
 * 1. Customer signup (immediate active account)
 * 2. Store partner application (pending approval)
 * 3. Driver application (pending approval)
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class RegistrationController {

    private final RegistrationService registrationService;

    /**
     * Register a new customer account
     * POST /api/auth/register/customer
     *
     * This is the simple signup flow for customers.
     * Creates an immediately active account and returns authentication tokens.
     * User is logged in after registration.
     */
    @PostMapping("/register/customer")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse registerCustomer(
            @Valid @RequestBody CustomerRegisterRequest request,
            HttpServletResponse response
    ) {
        return registrationService.registerCustomer(request, response);
    }

    /**
     * Submit store partner application
     * POST /api/auth/apply/store-partner
     *
     * Multi-step application form for store owners/managers.
     * Creates a pending account that requires admin approval.
     * User CANNOT log in until approved.
     * Returns application submission confirmation.
     */
    @PostMapping("/apply/store-partner")
    @ResponseStatus(HttpStatus.CREATED)
    public ApplicationSubmittedResponse applyAsStorePartner(
            @Valid @RequestBody StorePartnerApplicationRequest request
    ) {
        return registrationService.applyAsStorePartner(request);
    }

    /**
     * Submit driver application
     * POST /api/auth/apply/driver
     *
     * Multi-step application form for delivery drivers.
     * Creates a pending account that requires admin approval.
     * User CANNOT log in until approved.
     * Returns application submission confirmation.
     */
    @PostMapping("/apply/driver")
    @ResponseStatus(HttpStatus.CREATED)
    public ApplicationSubmittedResponse applyAsDriver(
            @Valid @RequestBody DriverApplicationRequest request
    ) {
        return registrationService.applyAsDriver(request);
    }
}
