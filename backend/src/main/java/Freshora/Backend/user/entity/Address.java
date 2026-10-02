package Freshora.Backend.user.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "addresses", indexes = {
        @Index(name = "idx_addresses_user", columnList = "user_id"),
        @Index(name = "idx_addresses_location", columnList = "latitude, longitude")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "line1", nullable = false, length = 500)
    private String line1;

    @Column(name = "city", nullable = false, length = 100)
    private String city;

    @Builder.Default
    @Column(name = "latitude", nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "longitude", nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude = BigDecimal.ZERO;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    // Helper compatibility methods for service, DTOs, and tests
    public String getAddressLine1() {
        return line1;
    }

    public void setAddressLine1(String addressLine1) {
        this.line1 = addressLine1;
    }

    public String getAddressLine2() {
        return null;
    }

    public String getLine2() {
        return null;
    }

    public String getLabel() {
        return "Home";
    }

    public String getRecipientName() {
        return user != null ? user.getName() : "";
    }

    public String getPhone() {
        return user != null ? user.getPhone() : "";
    }

    public String getDistrict() {
        return city;
    }

    public String getPostalCode() {
        return null;
    }

    public boolean isDefault() {
        return true;
    }

    public Instant getUpdatedAt() {
        return createdAt;
    }

    public static class AddressBuilder {
        @SuppressWarnings("unused")
        private BigDecimal latitude;
        @SuppressWarnings("unused")
        private BigDecimal longitude;

        public AddressBuilder addressLine1(String addressLine1) {
            this.line1 = addressLine1;
            return this;
        }

        public AddressBuilder latitude(BigDecimal latitude) {
            this.latitude = latitude;
            return this;
        }

        public AddressBuilder latitude(Double lat) {
            if (lat != null) {
                this.latitude = BigDecimal.valueOf(lat);
            }
            return this;
        }

        public AddressBuilder longitude(BigDecimal longitude) {
            this.longitude = longitude;
            return this;
        }

        public AddressBuilder longitude(Double lon) {
            if (lon != null) {
                this.longitude = BigDecimal.valueOf(lon);
            }
            return this;
        }

        public AddressBuilder label(String label) {
            return this;
        }

        public AddressBuilder recipientName(String recipientName) {
            return this;
        }

        public AddressBuilder phone(String phone) {
            return this;
        }

        public AddressBuilder addressLine2(String addressLine2) {
            return this;
        }

        public AddressBuilder district(String district) {
            return this;
        }

        public AddressBuilder postalCode(String postalCode) {
            return this;
        }

        public AddressBuilder isDefault(boolean isDefault) {
            return this;
        }
    }
}
