-- Freshora Database Schema V8
-- Driver and delivery management tables

-- ========================================
-- DRIVERS TABLE
-- ========================================
CREATE TABLE drivers (
    id BINARY(16) PRIMARY KEY,
    user_id BINARY(16) NOT NULL UNIQUE,
    status ENUM('OFFLINE', 'AVAILABLE', 'BUSY', 'ON_DELIVERY', 'SUSPENDED') NOT NULL DEFAULT 'OFFLINE',
    application_status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    vehicle_type VARCHAR(50) NOT NULL,
    license_number VARCHAR(50) NOT NULL,
    rating_avg DECIMAL(3, 2) NULL DEFAULT NULL,
    approved_by BINARY(16) NULL,
    last_seen_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_drivers_user (user_id),
    INDEX idx_drivers_status (status),
    INDEX idx_drivers_application_status (application_status),
    INDEX idx_drivers_rating (rating_avg)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- DELIVERIES TABLE
-- ========================================
CREATE TABLE deliveries (
    id BINARY(16) PRIMARY KEY,
    order_id BINARY(16) NOT NULL UNIQUE,
    driver_id BINARY(16) NULL,
    status ENUM('AVAILABLE', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'AVAILABLE',
    driver_earning DECIMAL(10, 2) NULL,
    version INT NOT NULL DEFAULT 0,
    assigned_at TIMESTAMP NULL,
    picked_up_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL,
    INDEX idx_deliveries_order (order_id),
    INDEX idx_deliveries_driver (driver_id),
    INDEX idx_deliveries_status (status),
    INDEX idx_deliveries_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- DELIVERY_OFFERS TABLE
-- ========================================
CREATE TABLE delivery_offers (
    id BINARY(16) PRIMARY KEY,
    delivery_id BINARY(16) NOT NULL,
    driver_id BINARY(16) NOT NULL,
    status ENUM('OFFERED', 'ACCEPTED', 'REJECTED', 'EXPIRED') NOT NULL DEFAULT 'OFFERED',
    offered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE,
    INDEX idx_delivery_offers_delivery (delivery_id),
    INDEX idx_delivery_offers_driver (driver_id),
    INDEX idx_delivery_offers_status (status),
    INDEX idx_delivery_offers_offered (offered_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- DRIVER_LOCATIONS TABLE
-- ========================================
CREATE TABLE driver_locations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    driver_id BINARY(16) NOT NULL,
    delivery_id BINARY(16) NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE,
    FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE SET NULL,
    INDEX idx_driver_locations_driver (driver_id),
    INDEX idx_driver_locations_delivery (delivery_id),
    INDEX idx_driver_locations_recorded (recorded_at),
    INDEX idx_driver_locations_location (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
