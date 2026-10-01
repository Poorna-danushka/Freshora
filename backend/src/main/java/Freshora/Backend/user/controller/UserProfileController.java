package Freshora.Backend.user.controller;

import Freshora.Backend.user.dto.AddressResponse;
import Freshora.Backend.user.dto.CreateAddressRequest;
import Freshora.Backend.user.dto.DriverProfileResponse;
import Freshora.Backend.user.dto.StoreProfileResponse;
import Freshora.Backend.user.dto.UpdateAddressRequest;
import Freshora.Backend.user.dto.UpdateProfileRequest;
import Freshora.Backend.user.dto.UserProfileResponse;
import Freshora.Backend.user.entity.User;
import Freshora.Backend.user.service.UserProfileService;
import Freshora.Backend.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserProfileController {
    private final UserProfileService userProfileService;
    private final UserService userService;

    @GetMapping("/users/me")
    public UserProfileResponse getMyProfile(Authentication authentication) {
        User currentUser = userService.findByEmail(authentication.getName());
        return userProfileService.getCurrentProfile(currentUser);
    }

    @PutMapping("/users/me")
    public UserProfileResponse updateMyProfile(Authentication authentication,
                                              @Valid @RequestBody UpdateProfileRequest request) {
        User currentUser = userService.findByEmail(authentication.getName());
        return userProfileService.updateCurrentProfile(currentUser, request);
    }

    @GetMapping("/users/me/addresses")
    public List<AddressResponse> getMyAddresses(Authentication authentication) {
        User currentUser = userService.findByEmail(authentication.getName());
        return userProfileService.getAddresses(currentUser);
    }

    @PostMapping("/users/me/addresses")
    @ResponseStatus(HttpStatus.CREATED)
    public AddressResponse createAddress(Authentication authentication,
                                        @Valid @RequestBody CreateAddressRequest request) {
        User currentUser = userService.findByEmail(authentication.getName());
        return userProfileService.createAddress(currentUser, request);
    }

    @PutMapping("/users/me/addresses/{id}")
    public AddressResponse updateAddress(Authentication authentication,
                                        @PathVariable Long id,
                                        @Valid @RequestBody UpdateAddressRequest request) {
        User currentUser = userService.findByEmail(authentication.getName());
        return userProfileService.updateAddress(currentUser, id, request);
    }

    @DeleteMapping("/users/me/addresses/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAddress(Authentication authentication, @PathVariable Long id) {
        User currentUser = userService.findByEmail(authentication.getName());
        userProfileService.deleteAddress(currentUser, id);
    }

    @PatchMapping("/users/me/addresses/{id}/default")
    public AddressResponse setDefaultAddress(Authentication authentication, @PathVariable Long id) {
        User currentUser = userService.findByEmail(authentication.getName());
        return userProfileService.setDefaultAddress(currentUser, id);
    }

    @GetMapping("/store/me")
    @PreAuthorize("hasAnyRole('STORE_MANAGER','STORE_STAFF')")
    public StoreProfileResponse getStoreProfile(Authentication authentication) {
        User currentUser = userService.findByEmail(authentication.getName());
        return userProfileService.getStoreProfile(currentUser);
    }

    @GetMapping("/driver/me")
    @PreAuthorize("hasRole('DRIVER')")
    public DriverProfileResponse getDriverProfile(Authentication authentication) {
        User currentUser = userService.findByEmail(authentication.getName());
        return userProfileService.getDriverProfile(currentUser);
    }

    @GetMapping("/admin/me")
    @PreAuthorize("hasRole('ADMIN')")
    public UserProfileResponse getAdminProfile(Authentication authentication) {
        User currentUser = userService.findByEmail(authentication.getName());
        return userProfileService.getCurrentProfile(currentUser);
    }
}
