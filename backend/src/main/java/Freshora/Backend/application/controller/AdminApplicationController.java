package Freshora.Backend.application.controller;

import Freshora.Backend.application.dto.ApplicationReviewActionRequest;
import Freshora.Backend.application.dto.DriverApplicationResponse;
import Freshora.Backend.application.dto.StoreApplicationResponse;
import Freshora.Backend.application.service.DriverApplicationService;
import Freshora.Backend.application.service.StoreApplicationService;
import Freshora.Backend.auth.dto.MessageResponse;
import Freshora.Backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminApplicationController {
    private final StoreApplicationService storeApplicationService;
    private final DriverApplicationService driverApplicationService;

    @GetMapping("/store-applications")
    public List<StoreApplicationResponse> listStoreApplications(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        return storeApplicationService.listApplications(status, search);
    }

    @GetMapping("/store-applications/{id}")
    public StoreApplicationResponse getStoreApplication(@PathVariable UUID id) {
        return storeApplicationService.getByIdForAdmin(id);
    }

    @PostMapping("/store-applications/{id}/approve")
    public MessageResponse approveStoreApplication(Authentication authentication, @PathVariable UUID id, @RequestBody(required = false) ApplicationReviewActionRequest request) {
        User reviewer = (User) authentication.getPrincipal();
        if (request == null) {
            request = new ApplicationReviewActionRequest("APPROVE", null);
        }
        return storeApplicationService.reviewApplication(reviewer, id, request);
    }

    @PostMapping("/store-applications/{id}/reject")
    public MessageResponse rejectStoreApplication(Authentication authentication, @PathVariable UUID id, @RequestBody(required = false) ApplicationReviewActionRequest request) {
        User reviewer = (User) authentication.getPrincipal();
        if (request == null) {
            request = new ApplicationReviewActionRequest("REJECT", null);
        } else {
            request = new ApplicationReviewActionRequest("REJECT", request.note());
        }
        return storeApplicationService.reviewApplication(reviewer, id, request);
    }

    @PostMapping("/store-applications/{id}/request-information")
    public MessageResponse requestInfoStoreApplication(Authentication authentication, @PathVariable UUID id, @RequestBody(required = false) ApplicationReviewActionRequest request) {
        User reviewer = (User) authentication.getPrincipal();
        if (request == null) {
            request = new ApplicationReviewActionRequest("REQUEST_MORE_INFO", null);
        } else {
            request = new ApplicationReviewActionRequest("REQUEST_MORE_INFO", request.note());
        }
        return storeApplicationService.reviewApplication(reviewer, id, request);
    }

    @GetMapping("/driver-applications")
    public List<DriverApplicationResponse> listDriverApplications(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        return driverApplicationService.listApplications(status, search);
    }

    @GetMapping("/driver-applications/{id}")
    public DriverApplicationResponse getDriverApplication(@PathVariable UUID id) {
        return driverApplicationService.getByIdForAdmin(id);
    }

    @PostMapping("/driver-applications/{id}/approve")
    public MessageResponse approveDriverApplication(Authentication authentication, @PathVariable UUID id, @RequestBody(required = false) ApplicationReviewActionRequest request) {
        User reviewer = (User) authentication.getPrincipal();
        if (request == null) {
            request = new ApplicationReviewActionRequest("APPROVE", null);
        }
        return driverApplicationService.reviewApplication(reviewer, id, request);
    }

    @PostMapping("/driver-applications/{id}/reject")
    public MessageResponse rejectDriverApplication(Authentication authentication, @PathVariable UUID id, @RequestBody(required = false) ApplicationReviewActionRequest request) {
        User reviewer = (User) authentication.getPrincipal();
        if (request == null) {
            request = new ApplicationReviewActionRequest("REJECT", null);
        } else {
            request = new ApplicationReviewActionRequest("REJECT", request.note());
        }
        return driverApplicationService.reviewApplication(reviewer, id, request);
    }

    @PostMapping("/driver-applications/{id}/request-information")
    public MessageResponse requestInfoDriverApplication(Authentication authentication, @PathVariable UUID id, @RequestBody(required = false) ApplicationReviewActionRequest request) {
        User reviewer = (User) authentication.getPrincipal();
        if (request == null) {
            request = new ApplicationReviewActionRequest("REQUEST_MORE_INFO", null);
        } else {
            request = new ApplicationReviewActionRequest("REQUEST_MORE_INFO", request.note());
        }
        return driverApplicationService.reviewApplication(reviewer, id, request);
    }
}
