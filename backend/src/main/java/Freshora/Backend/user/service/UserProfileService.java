package Freshora.Backend.user.service;

import Freshora.Backend.application.entity.DriverApplication;
import Freshora.Backend.application.entity.StoreApplication;
import Freshora.Backend.application.repository.DriverApplicationRepository;
import Freshora.Backend.application.repository.StoreApplicationRepository;
import Freshora.Backend.exception.AuthenticationException;
import Freshora.Backend.user.dto.AddressResponse;
import Freshora.Backend.user.dto.CreateAddressRequest;
import Freshora.Backend.user.dto.DriverProfileResponse;
import Freshora.Backend.user.dto.StoreProfileResponse;
import Freshora.Backend.user.dto.UpdateAddressRequest;
import Freshora.Backend.user.dto.UpdateProfileRequest;
import Freshora.Backend.user.dto.UserProfileResponse;
import Freshora.Backend.user.entity.Address;
import Freshora.Backend.user.entity.User;
import Freshora.Backend.user.repository.AddressRepository;
import Freshora.Backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserProfileService {
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final StoreApplicationRepository storeApplicationRepository;
    private final DriverApplicationRepository driverApplicationRepository;

    public UserProfileResponse getCurrentProfile(User currentUser) {
        if (currentUser == null) {
            throw new AuthenticationException("Authentication required");
        }
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new AuthenticationException("User not found"));
        return toUserProfileResponse(user);
    }

    @Transactional
    public UserProfileResponse updateCurrentProfile(User currentUser, UpdateProfileRequest request) {
        if (currentUser == null) {
            throw new AuthenticationException("Authentication required");
        }
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new AuthenticationException("User not found"));

        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        user.setPhone(request.phone() == null || request.phone().isBlank() ? null : request.phone().trim());
        user.setProfileImageUrl(request.profileImageUrl() == null || request.profileImageUrl().isBlank() ? null : request.profileImageUrl().trim());
        return toUserProfileResponse(userRepository.save(user));
    }

    public List<AddressResponse> getAddresses(User currentUser) {
        if (currentUser == null) {
            throw new AuthenticationException("Authentication required");
        }
        return addressRepository.findByUserOrderByCreatedAtDesc(currentUser).stream()
                .map(this::toAddressResponse)
                .toList();
    }

    @Transactional
    public AddressResponse createAddress(User currentUser, CreateAddressRequest request) {
        if (currentUser == null) {
            throw new AuthenticationException("Authentication required");
        }

        BigDecimal lat = request.latitude() != null ? BigDecimal.valueOf(request.latitude()) : BigDecimal.ZERO;
        BigDecimal lon = request.longitude() != null ? BigDecimal.valueOf(request.longitude()) : BigDecimal.ZERO;

        Address address = Address.builder()
                .user(currentUser)
                .line1(request.addressLine1().trim())
                .city(request.city().trim())
                .latitude(lat)
                .longitude(lon)
                .build();

        Address saved = addressRepository.save(address);
        return toAddressResponse(saved);
    }

    @Transactional
    public AddressResponse updateAddress(User currentUser, UUID id, UpdateAddressRequest request) {
        Address address = addressRepository.findByUserAndId(currentUser, id)
                .orElseThrow(() -> new AuthenticationException("Address not found"));

        address.setLine1(request.addressLine1().trim());
        address.setCity(request.city().trim());
        if (request.latitude() != null) {
            address.setLatitude(BigDecimal.valueOf(request.latitude()));
        }
        if (request.longitude() != null) {
            address.setLongitude(BigDecimal.valueOf(request.longitude()));
        }
        return toAddressResponse(addressRepository.save(address));
    }

    @Transactional
    public void deleteAddress(User currentUser, UUID id) {
        Address address = addressRepository.findByUserAndId(currentUser, id)
                .orElseThrow(() -> new AuthenticationException("Address not found"));

        addressRepository.delete(address);
    }

    @Transactional
    public AddressResponse setDefaultAddress(User currentUser, UUID id) {
        Address target = addressRepository.findByUserAndId(currentUser, id)
                .orElseThrow(() -> new AuthenticationException("Address not found"));

        return toAddressResponse(target);
    }

    public StoreProfileResponse getStoreProfile(User currentUser) {
        if (currentUser == null) {
            throw new AuthenticationException("Authentication required");
        }
        StoreApplication storeApplication = storeApplicationRepository.findAll().stream()
                .filter(application -> application.getEmail() != null && application.getEmail().equalsIgnoreCase(currentUser.getEmail()))
                .max(Comparator.comparing((StoreApplication app) -> app.getSubmittedAt(), Comparator.nullsLast(Comparator.naturalOrder())))
                .orElse(null);

        return new StoreProfileResponse(
                currentUser.getId(),
                currentUser.getEmail(),
                currentUser.getPhone(),
                storeApplication == null ? "Store registration pending" : storeApplication.getStoreName(),
                storeApplication == null ? "PENDING" : storeApplication.getStatus().name(),
                storeApplication == null ? null : storeApplication.getStoreAddress(),
                currentUser.getRole().name()
        );
    }

    public DriverProfileResponse getDriverProfile(User currentUser) {
        if (currentUser == null) {
            throw new AuthenticationException("Authentication required");
        }
        DriverApplication driverApplication = driverApplicationRepository.findAll().stream()
                .filter(application -> application.getEmail() != null && application.getEmail().equalsIgnoreCase(currentUser.getEmail()))
                .max(Comparator.comparing((DriverApplication app) -> app.getSubmittedAt(), Comparator.nullsLast(Comparator.naturalOrder())))
                .orElse(null);

        return new DriverProfileResponse(
                currentUser.getId(),
                currentUser.getEmail(),
                currentUser.getPhone(),
                driverApplication == null ? currentUser.getFirstName() + " " + currentUser.getLastName() : driverApplication.getFullName(),
                driverApplication == null ? "PENDING" : driverApplication.getStatus().name(),
                driverApplication == null ? null : driverApplication.getVehicleType(),
                driverApplication == null ? null : driverApplication.getPreferredAreas(),
                currentUser.getRole().name()
        );
    }

    private UserProfileResponse toUserProfileResponse(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                (user.getFirstName() + " " + user.getLastName()).trim(),
                user.getEmail(),
                user.getPhone(),
                user.getRole().name(),
                user.getStatus() == null ? null : user.getStatus().name(),
                user.getProfileImageUrl()
        );
    }

    private AddressResponse toAddressResponse(Address address) {
        return new AddressResponse(
                address.getId(),
                address.getLabel(),
                address.getRecipientName(),
                address.getPhone(),
                address.getAddressLine1(),
                null,
                address.getCity(),
                address.getDistrict(),
                address.getPostalCode(),
                address.getLatitude(),
                address.getLongitude(),
                address.isDefault(),
                address.getCreatedAt(),
                address.getUpdatedAt()
        );
    }
}
