package Freshora.Backend.application.controller;

import Freshora.Backend.application.dto.DriverApplicationRequest;
import Freshora.Backend.application.dto.DriverApplicationResponse;
import Freshora.Backend.application.dto.MyApplicationsResponse;
import Freshora.Backend.application.dto.StoreApplicationRequest;
import Freshora.Backend.application.dto.StoreApplicationResponse;
import Freshora.Backend.application.service.DriverApplicationService;
import Freshora.Backend.application.service.StoreApplicationService;
import Freshora.Backend.user.entity.User;
import jakarta.validation.Valid;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ApplicationController {
    private final StoreApplicationService storeApplicationService;
    private final DriverApplicationService driverApplicationService;
    private final Validator validator;

    @PostMapping(value = "/applications/stores", consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public StoreApplicationResponse submitStoreApplicationJson(Authentication authentication, @Valid @RequestBody StoreApplicationRequest request) {
        User currentUser = (User) authentication.getPrincipal();
        return storeApplicationService.submit(currentUser, request, Map.of());
    }

    @PostMapping(value = "/applications/stores", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public StoreApplicationResponse submitStoreApplication(Authentication authentication, MultipartHttpServletRequest request) {
        User currentUser = (User) authentication.getPrincipal();
        StoreApplicationRequest payload = validate(new StoreApplicationRequest(
                request.getParameter("applicantName"),
                request.getParameter("email"),
                request.getParameter("contactNumber"),
                request.getParameter("alternateContactNumber"),
                request.getParameter("preferredContactMethod"),
                request.getParameter("applicantNotes"),
                request.getParameter("storeName"),
                request.getParameter("storeContactNumber"),
                request.getParameter("storeEmail"),
                request.getParameter("storeAddress"),
                request.getParameter("city"),
                request.getParameter("province"),
                request.getParameter("postalCode"),
                request.getParameter("storeType"),
                request.getParameter("registrationNumber"),
                request.getParameter("storeDescription")
        ));

        Map<String, MultipartFile> files = new HashMap<>();
        request.getFileMap().forEach(files::put);
        return storeApplicationService.submit(currentUser, payload, files);
    }

    @PutMapping(value = "/applications/stores/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public StoreApplicationResponse updateStoreApplication(
            Authentication authentication, @PathVariable java.util.UUID id, MultipartHttpServletRequest request) {
        User currentUser = (User) authentication.getPrincipal();
        StoreApplicationRequest payload = validate(new StoreApplicationRequest(
                request.getParameter("applicantName"),
                request.getParameter("email"),
                request.getParameter("contactNumber"),
                request.getParameter("alternateContactNumber"),
                request.getParameter("preferredContactMethod"),
                request.getParameter("applicantNotes"),
                request.getParameter("storeName"),
                request.getParameter("storeContactNumber"),
                request.getParameter("storeEmail"),
                request.getParameter("storeAddress"),
                request.getParameter("city"),
                request.getParameter("province"),
                request.getParameter("postalCode"),
                request.getParameter("storeType"),
                request.getParameter("registrationNumber"),
                request.getParameter("storeDescription")
        ));
        return storeApplicationService.updateAndResubmit(currentUser, id, payload, uploadedFiles(request));
    }

    @PostMapping(value = "/applications/drivers", consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public DriverApplicationResponse submitDriverApplicationJson(Authentication authentication, @Valid @RequestBody DriverApplicationRequest request) {
        User currentUser = (User) authentication.getPrincipal();
        return driverApplicationService.submit(currentUser, request, Map.of());
    }

    @PostMapping(value = "/applications/drivers", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public DriverApplicationResponse submitDriverApplication(Authentication authentication, MultipartHttpServletRequest request) {
        User currentUser = (User) authentication.getPrincipal();
        DriverApplicationRequest payload = validate(new DriverApplicationRequest(
                request.getParameter("fullName"),
                request.getParameter("email"),
                request.getParameter("contactNumber"),
                request.getParameter("dateOfBirth"),
                request.getParameter("address"),
                request.getParameter("city"),
                request.getParameter("province"),
                request.getParameter("emergencyContactName"),
                request.getParameter("emergencyContactNumber"),
                request.getParameter("vehicleType"),
                request.getParameter("vehicleRegistrationNumber"),
                request.getParameter("vehicleMake"),
                request.getParameter("vehicleModel"),
                request.getParameter("vehicleYear"),
                request.getParameter("vehicleColor"),
                request.getParameter("ownershipType"),
                request.getParameter("preferredArea"),
                request.getParameter("preferredWorkingDays"),
                request.getParameter("preferredWorkingHours"),
                request.getParameter("deliveryExperience"),
                Boolean.parseBoolean(request.getParameter("hasSmartphone")),
                request.getParameter("hasDeliveryBag") == null || request.getParameter("hasDeliveryBag").isBlank() ? null : Boolean.parseBoolean(request.getParameter("hasDeliveryBag")),
                request.getParameter("additionalNotes")
        ));

        return driverApplicationService.submit(currentUser, payload, uploadedFiles(request));
    }

    @PutMapping(value = "/applications/drivers/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public DriverApplicationResponse updateDriverApplication(
            Authentication authentication, @PathVariable java.util.UUID id, MultipartHttpServletRequest request) {
        User currentUser = (User) authentication.getPrincipal();
        DriverApplicationRequest payload = validate(new DriverApplicationRequest(
                request.getParameter("fullName"),
                request.getParameter("email"),
                request.getParameter("contactNumber"),
                request.getParameter("dateOfBirth"),
                request.getParameter("address"),
                request.getParameter("city"),
                request.getParameter("province"),
                request.getParameter("emergencyContactName"),
                request.getParameter("emergencyContactNumber"),
                request.getParameter("vehicleType"),
                request.getParameter("vehicleRegistrationNumber"),
                request.getParameter("vehicleMake"),
                request.getParameter("vehicleModel"),
                request.getParameter("vehicleYear"),
                request.getParameter("vehicleColor"),
                request.getParameter("ownershipType"),
                request.getParameter("preferredArea"),
                request.getParameter("preferredWorkingDays"),
                request.getParameter("preferredWorkingHours"),
                request.getParameter("deliveryExperience"),
                Boolean.parseBoolean(request.getParameter("hasSmartphone")),
                request.getParameter("hasDeliveryBag") == null || request.getParameter("hasDeliveryBag").isBlank()
                        ? null : Boolean.parseBoolean(request.getParameter("hasDeliveryBag")),
                request.getParameter("additionalNotes")
        ));
        return driverApplicationService.updateAndResubmit(currentUser, id, payload, uploadedFiles(request));
    }

    @GetMapping("/applications/me")
    public MyApplicationsResponse getMyApplications(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        return new MyApplicationsResponse(
                storeApplicationService.getApplicationsForUser(currentUser),
                driverApplicationService.getApplicationsForUser(currentUser));
    }

    @GetMapping("/applications/stores/{id}")
    public StoreApplicationResponse getStoreApplication(Authentication authentication, @PathVariable java.util.UUID id) {
        return storeApplicationService.getById((User) authentication.getPrincipal(), id);
    }

    @GetMapping("/applications/drivers/{id}")
    public DriverApplicationResponse getDriverApplication(Authentication authentication, @PathVariable java.util.UUID id) {
        return driverApplicationService.getById((User) authentication.getPrincipal(), id);
    }

    private Map<String, MultipartFile> uploadedFiles(MultipartHttpServletRequest request) {
        Map<String, MultipartFile> files = new HashMap<>();
        request.getFileMap().forEach(files::put);
        return files;
    }

    private <T> T validate(T request) {
        Set<ConstraintViolation<T>> violations = validator.validate(request);
        if (!violations.isEmpty()) {
            String message = violations.stream()
                    .map(v -> v.getMessage())
                    .sorted()
                    .collect(Collectors.joining("; "));
            throw new IllegalArgumentException(message);
        }
        return request;
    }
}
