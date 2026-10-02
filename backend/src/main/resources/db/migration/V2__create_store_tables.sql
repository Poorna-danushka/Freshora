-- Freshora Database Schema V2
-- Store-related tables: Stores, Store Hours, Store Staff

-- ========================================
-- STORES TABLE
-- ========================================
CREATE TABLE stores (
    id BINARY(16) PRIMARY KEY,
    manager_id BINARY(16) NOT NULL,
    name VARCHAR(255) NOT NULL,
    status ENUM('PENDING_APPROVAL', 'ACTIVE', 'TEMP_CLOSED', 'SUSPENDED', 'INACTIVE') NOT NULL DEFAULT 'PENDING_APPROVAL',
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    commission_rate DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    approved_by BINARY(16) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_stores_manager (manager_id),
    INDEX idx_stores_status (status),
    INDEX idx_stores_location (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- STORE_HOURS TABLE
-- ========================================
CREATE TABLE store_hours (
    id BINARY(16) PRIMARY KEY,
    store_id BINARY(16) NOT NULL,
    day_of_week SMALLINT NOT NULL,
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    CONSTRAINT chk_day_of_week CHECK (day_of_week BETWEEN 0 AND 6),
    INDEX idx_store_hours_store (store_id),
    INDEX idx_store_hours_day (day_of_week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- STORE_STAFF TABLE
-- ========================================
CREATE TABLE store_staff (
    id BINARY(16) PRIMARY KEY,
    store_id BINARY(16) NOT NULL,
    user_id BINARY(16) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_store_staff (store_id, user_id),
    INDEX idx_store_staff_store (store_id),
    INDEX idx_store_staff_user (user_id),
    INDEX idx_store_staff_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
