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

import java.util.Comparator;
import java.util.List;
import java.util.Objects;

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
        return addressRepository.findByUserOrderByIsDefaultDescCreatedAtDesc(currentUser).stream()
                .map(this::toAddressResponse)
                .toList();
    }

    @Transactional
    public AddressResponse createAddress(User currentUser, CreateAddressRequest request) {
        if (currentUser == null) {
            throw new AuthenticationException("Authentication required");
        }

        boolean isDefault = Boolean.TRUE.equals(request.isDefault());
        Address address = Address.builder()
                .user(currentUser)
                .label(request.label().trim())
                .recipientName(request.recipientName().trim())
                .phone(request.phone().trim())
                .addressLine1(request.addressLine1().trim())
                .addressLine2(request.addressLine2() == null ? null : request.addressLine2().trim())
                .city(request.city().trim())
                .district(request.district().trim())
                .postalCode(request.postalCode() == null ? null : request.postalCode().trim())
                .latitude(request.latitude())
                .longitude(request.longitude())
                .isDefault(false)
                .build();

        if (isDefault || addressRepository.countByUser(currentUser) == 0) {
            address.setDefault(true);
        }

        Address saved = addressRepository.save(address);
        if (address.isDefault()) {
            setDefaultAddress(currentUser, saved.getId());
        }
        return toAddressResponse(saved);
    }

    @Transactional
    public AddressResponse updateAddress(User currentUser, Long id, UpdateAddressRequest request) {
        Address address = addressRepository.findByUserAndId(currentUser, id)
                .orElseThrow(() -> new AuthenticationException("Address not found"));

        address.setLabel(request.label().trim());
        address.setRecipientName(request.recipientName().trim());
        address.setPhone(request.phone().trim());
        address.setAddressLine1(request.addressLine1().trim());
        address.setAddressLine2(request.addressLine2() == null ? null : request.addressLine2().trim());
        address.setCity(request.city().trim());
        address.setDistrict(request.district().trim());
        address.setPostalCode(request.postalCode() == null ? null : request.postalCode().trim());
        address.setLatitude(request.latitude());
        address.setLongitude(request.longitude());
        return toAddressResponse(addressRepository.save(address));
    }

    @Transactional
    public void deleteAddress(User currentUser, Long id) {
        Address address = addressRepository.findByUserAndId(currentUser, id)
                .orElseThrow(() -> new AuthenticationException("Address not found"));

        boolean removedDefault = address.isDefault();
        addressRepository.delete(address);
        if (removedDefault) {
            addressRepository.findByUserOrderByIsDefaultDescCreatedAtDesc(currentUser).stream().findFirst()
                    .ifPresent(first -> {
                        first.setDefault(true);
                        addressRepository.save(first);
                    });
        }
    }

    @Transactional
    public AddressResponse setDefaultAddress(User currentUser, Long id) {
        Address target = addressRepository.findByUserAndId(currentUser, id)
                .orElseThrow(() -> new AuthenticationException("Address not found"));

        addressRepository.findByUserOrderByIsDefaultDescCreatedAtDesc(currentUser)
                .forEach(address -> {
                    boolean isTarget = Objects.equals(address.getId(), target.getId());
                    address.setDefault(isTarget);
                    addressRepository.save(address);
                });

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
                driverApplication == null ? null : driverApplication.getPreferredArea(),
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
                address.getAddressLine2(),
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
