-- Freshora Database Schema V4
-- Inventory management tables

-- ========================================
-- INVENTORY TABLE
-- ========================================
CREATE TABLE inventory (
    id BINARY(16) PRIMARY KEY,
    product_id BINARY(16) NOT NULL UNIQUE,
    store_id BINARY(16) NOT NULL,
    available_qty INT NOT NULL DEFAULT 0,
    reserved_qty INT NOT NULL DEFAULT 0,
    confirmed_qty INT NOT NULL DEFAULT 0,
    low_stock_threshold INT NOT NULL DEFAULT 10,
    version INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    CONSTRAINT chk_available_qty CHECK (available_qty >= 0),
    CONSTRAINT chk_reserved_qty CHECK (reserved_qty >= 0),
    INDEX idx_inventory_product (product_id),
    INDEX idx_inventory_store (store_id),
    INDEX idx_inventory_low_stock (low_stock_threshold, available_qty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- INVENTORY_RESERVATIONS TABLE
-- ========================================
CREATE TABLE inventory_reservations (
    id BINARY(16) PRIMARY KEY,
    order_id BINARY(16) NOT NULL,
    inventory_id BINARY(16) NOT NULL,
    quantity INT NOT NULL,
    status ENUM('RESERVED', 'CONFIRMED', 'RELEASED', 'EXPIRED') NOT NULL DEFAULT 'RESERVED',
    expires_at TIMESTAMP NOT NULL,
    released_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE,
    INDEX idx_inventory_reservations_order (order_id),
    INDEX idx_inventory_reservations_inventory (inventory_id),
    INDEX idx_inventory_reservations_status (status),
    INDEX idx_inventory_reservations_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- INVENTORY_ADJUSTMENTS TABLE
-- ========================================
CREATE TABLE inventory_adjustments (
    id BINARY(16) PRIMARY KEY,
    inventory_id BINARY(16) NOT NULL,
    delta INT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    actor_id BINARY(16) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_inventory_adjustments_inventory (inventory_id),
    INDEX idx_inventory_adjustments_actor (actor_id),
    INDEX idx_inventory_adjustments_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
