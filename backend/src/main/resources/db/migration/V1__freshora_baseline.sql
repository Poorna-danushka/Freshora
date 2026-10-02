-- Freshora complete schema baseline. Add all future schema changes as new migrations.

-- Base tables: Users, Roles, Authentication, Addresses

-- ========================================
-- USERS TABLE
-- ========================================
CREATE TABLE users (
    id BINARY(16) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    profile_image_url VARCHAR(500) NULL,
    status ENUM('ACTIVE', 'SUSPENDED', 'PENDING') NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_phone (phone),
    INDEX idx_users_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- ROLES TABLE
-- ========================================
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    CONSTRAINT chk_role_name CHECK (name IN ('CUSTOMER', 'STORE_MANAGER', 'STORE_STAFF', 'DRIVER', 'ADMIN'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert predefined roles
INSERT INTO roles (name) VALUES
    ('CUSTOMER'),
    ('STORE_MANAGER'),
    ('STORE_STAFF'),
    ('DRIVER'),
    ('ADMIN');

-- ========================================
-- USER_ROLES TABLE (Many-to-Many)
-- ========================================
CREATE TABLE user_roles (
    user_id BINARY(16) NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    INDEX idx_user_roles_user (user_id),
    INDEX idx_user_roles_role (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- AUTH_TOKENS TABLE
-- ========================================
CREATE TABLE auth_tokens (
    id BINARY(16) PRIMARY KEY,
    user_id BINARY(16) NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    type ENUM('REFRESH', 'RESET', 'VERIFY') NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_auth_tokens_user (user_id),
    INDEX idx_auth_tokens_type (type),
    INDEX idx_auth_tokens_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- ADDRESSES TABLE
-- ========================================
CREATE TABLE addresses (
    id BINARY(16) PRIMARY KEY,
    user_id BINARY(16) NOT NULL,
    line1 VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_addresses_user (user_id),
    INDEX idx_addresses_location (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

-- Product-related tables: Categories, Products, Coupons

-- ========================================
-- CATEGORIES TABLE (Self-referencing)
-- ========================================
CREATE TABLE categories (
    id BINARY(16) PRIMARY KEY,
    parent_id BINARY(16) NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_categories_parent (parent_id),
    INDEX idx_categories_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- PRODUCTS TABLE
-- ========================================
CREATE TABLE products (
    id BINARY(16) PRIMARY KEY,
    store_id BINARY(16) NOT NULL,
    category_id BINARY(16) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    brand VARCHAR(255) NULL,
    unit VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(500) NULL,
    status ENUM('ACTIVE', 'INACTIVE', 'OUT_OF_STOCK') NOT NULL DEFAULT 'ACTIVE',
    version INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_products_store (store_id),
    INDEX idx_products_category (category_id),
    INDEX idx_products_status (status),
    INDEX idx_products_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- COUPONS TABLE
-- ========================================
CREATE TABLE coupons (
    id BINARY(16) PRIMARY KEY,
    store_id BINARY(16) NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_type ENUM('PERCENTAGE', 'FIXED_AMOUNT') NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    max_redemptions INT NULL,
    valid_until TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    INDEX idx_coupons_store (store_id),
    INDEX idx_coupons_code (code),
    INDEX idx_coupons_valid_until (valid_until)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- COUPON_REDEMPTIONS TABLE
-- ========================================
CREATE TABLE coupon_redemptions (
    id BINARY(16) PRIMARY KEY,
    coupon_id BINARY(16) NOT NULL,
    user_id BINARY(16) NOT NULL,
    order_id BINARY(16) NOT NULL UNIQUE,
    redeemed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_coupon_redemptions_coupon (coupon_id),
    INDEX idx_coupon_redemptions_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

-- Shopping cart tables

-- ========================================
-- CARTS TABLE
-- ========================================
CREATE TABLE carts (
    id BINARY(16) PRIMARY KEY,
    customer_id BINARY(16) NOT NULL,
    store_id BINARY(16) NOT NULL,
    status ENUM('ACTIVE', 'CHECKED_OUT', 'ABANDONED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    INDEX idx_carts_customer (customer_id),
    INDEX idx_carts_store (store_id),
    INDEX idx_carts_status (status),
    INDEX idx_carts_updated (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- CART_ITEMS TABLE
-- ========================================
CREATE TABLE cart_items (
    id BINARY(16) PRIMARY KEY,
    cart_id BINARY(16) NOT NULL,
    product_id BINARY(16) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY uk_cart_items (cart_id, product_id),
    INDEX idx_cart_items_cart (cart_id),
    INDEX idx_cart_items_product (product_id),
    CONSTRAINT chk_cart_items_quantity CHECK (quantity > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order management tables

-- ========================================
-- ORDERS TABLE
-- ========================================
CREATE TABLE orders (
    id BINARY(16) PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id BINARY(16) NOT NULL,
    store_id BINARY(16) NOT NULL,
    address_id BINARY(16) NOT NULL,
    address_snapshot JSON NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    subtotal DECIMAL(10, 2) NOT NULL,
    delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    commission_rate DECIMAL(5, 2) NOT NULL,
    commission_amount DECIMAL(10, 2) NOT NULL,
    store_amount DECIMAL(10, 2) NOT NULL,
    version INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP NULL,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE RESTRICT,
    FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE RESTRICT,
    INDEX idx_orders_customer (customer_id),
    INDEX idx_orders_store (store_id),
    INDEX idx_orders_status (status),
    INDEX idx_orders_created (created_at),
    INDEX idx_orders_number (order_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- ORDER_ITEMS TABLE
-- ========================================
CREATE TABLE order_items (
    id BINARY(16) PRIMARY KEY,
    order_id BINARY(16) NOT NULL,
    product_id BINARY(16) NOT NULL,
    substitute_product_id BINARY(16) NULL,
    product_name VARCHAR(255) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    line_total DECIMAL(10, 2) NOT NULL,
    pick_status ENUM('PENDING', 'PICKED', 'UNAVAILABLE', 'SUBSTITUTED') NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    FOREIGN KEY (substitute_product_id) REFERENCES products(id) ON DELETE SET NULL,
    INDEX idx_order_items_order (order_id),
    INDEX idx_order_items_product (product_id),
    INDEX idx_order_items_pick_status (pick_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- ORDER_EVENTS TABLE
-- ========================================
CREATE TABLE order_events (
    id BINARY(16) PRIMARY KEY,
    order_id BINARY(16) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    from_status VARCHAR(50) NULL,
    to_status VARCHAR(50) NOT NULL,
    version INT NOT NULL,
    payload JSON NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    UNIQUE KEY uk_order_events_version (order_id, version),
    INDEX idx_order_events_order (order_id),
    INDEX idx_order_events_type (event_type),
    INDEX idx_order_events_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign key constraint to inventory_reservations (referenced in V4 but orders didn't exist yet)
ALTER TABLE inventory_reservations
    ADD CONSTRAINT fk_inventory_reservations_order
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

-- Add foreign key constraint to coupon_redemptions
ALTER TABLE coupon_redemptions
    ADD CONSTRAINT fk_coupon_redemptions_order
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

-- Payment and refund tables

-- ========================================
-- PAYMENTS TABLE
-- ========================================
CREATE TABLE payments (
    id BINARY(16) PRIMARY KEY,
    order_id BINARY(16) NOT NULL,
    status ENUM('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    amount DECIMAL(10, 2) NOT NULL,
    provider_ref VARCHAR(255) NULL UNIQUE,
    idempotency_key VARCHAR(255) NOT NULL UNIQUE,
    attempts INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT,
    INDEX idx_payments_order (order_id),
    INDEX idx_payments_status (status),
    INDEX idx_payments_provider_ref (provider_ref),
    INDEX idx_payments_idempotency_key (idempotency_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- PAYMENT_CALLBACKS TABLE
-- ========================================
CREATE TABLE payment_callbacks (
    id BINARY(16) PRIMARY KEY,
    payment_id BINARY(16) NOT NULL,
    provider_event_id VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL,
    payload JSON NOT NULL,
    processed BOOLEAN NOT NULL DEFAULT FALSE,
    received_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    INDEX idx_payment_callbacks_payment (payment_id),
    INDEX idx_payment_callbacks_provider_event (provider_event_id),
    INDEX idx_payment_callbacks_processed (processed),
    INDEX idx_payment_callbacks_received (received_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- REFUNDS TABLE
-- ========================================
CREATE TABLE refunds (
    id BINARY(16) PRIMARY KEY,
    payment_id BINARY(16) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status ENUM('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING',
    reason VARCHAR(500) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE RESTRICT,
    INDEX idx_refunds_payment (payment_id),
    INDEX idx_refunds_status (status),
    INDEX idx_refunds_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

-- Review and rating tables

-- ========================================
-- REVIEWS TABLE
-- ========================================
CREATE TABLE reviews (
    id BINARY(16) PRIMARY KEY,
    order_id BINARY(16) NOT NULL,
    customer_id BINARY(16) NOT NULL,
    store_id BINARY(16) NULL,
    product_id BINARY(16) NULL,
    driver_id BINARY(16) NULL,
    rating SMALLINT NOT NULL,
    comment TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE,
    CONSTRAINT chk_rating CHECK (rating BETWEEN 1 AND 5),
    INDEX idx_reviews_order (order_id),
    INDEX idx_reviews_customer (customer_id),
    INDEX idx_reviews_store (store_id),
    INDEX idx_reviews_product (product_id),
    INDEX idx_reviews_driver (driver_id),
    INDEX idx_reviews_rating (rating),
    INDEX idx_reviews_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- System tables: Idempotency, Notifications, Events, Audit

-- ========================================
-- IDEMPOTENCY_RECORDS TABLE
-- ========================================
CREATE TABLE idempotency_records (
    id BINARY(16) PRIMARY KEY,
    idem_key VARCHAR(255) NOT NULL,
    user_id BINARY(16) NOT NULL,
    operation VARCHAR(100) NOT NULL,
    request_hash VARCHAR(255) NOT NULL,
    status VARCHAR(255) NOT NULL DEFAULT 'IN_PROGRESS',
    response JSON NULL,
    order_id BINARY(16) NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    UNIQUE KEY uk_idempotency_user_key_operation (user_id, idem_key, operation),
    INDEX idx_idempotency_user (user_id),
    INDEX idx_idempotency_order (order_id),
    INDEX idx_idempotency_status (status),
    INDEX idx_idempotency_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- NOTIFICATIONS TABLE
-- ========================================
CREATE TABLE notifications (
    id BINARY(16) PRIMARY KEY,
    user_id BINARY(16) NOT NULL,
    order_id BINARY(16) NULL,
    source_event_id BINARY(16) NULL,
    channel ENUM('IN_APP', 'EMAIL', 'PUSH') NOT NULL,
    type VARCHAR(100) NOT NULL,
    status ENUM('PENDING', 'SENT', 'FAILED', 'DEAD') NOT NULL DEFAULT 'PENDING',
    attempts INT NOT NULL DEFAULT 0,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    payload JSON NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    UNIQUE KEY uk_notifications_event (user_id, source_event_id, channel),
    INDEX idx_notifications_user (user_id),
    INDEX idx_notifications_order (order_id),
    INDEX idx_notifications_status (status),
    INDEX idx_notifications_channel (channel),
    INDEX idx_notifications_type (type),
    INDEX idx_notifications_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- OUTBOX_EVENTS TABLE
-- ========================================
CREATE TABLE outbox_events (
    id BINARY(16) PRIMARY KEY,
    aggregate_type VARCHAR(255) NOT NULL,
    aggregate_id BINARY(16) NOT NULL,
    event_type VARCHAR(255) NOT NULL,
    version INT NOT NULL,
    payload JSON NOT NULL,
    status VARCHAR(255) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP NULL,
    attempts INT NOT NULL DEFAULT 0,
    last_error VARCHAR(255) NULL,
    INDEX idx_outbox_status_created (status, created_at),
    INDEX idx_outbox_events_status (status),
    INDEX idx_outbox_events_aggregate (aggregate_type, aggregate_id),
    INDEX idx_outbox_events_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- PROCESSED_EVENTS TABLE
-- ========================================
CREATE TABLE processed_events (
    consumer VARCHAR(100) NOT NULL,
    event_id BINARY(16) NOT NULL,
    processed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (consumer, event_id),
    INDEX idx_processed_events_event (event_id),
    INDEX idx_processed_events_processed (processed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- DEAD_LETTER_MESSAGES TABLE
-- ========================================
CREATE TABLE dead_letter_messages (
    id BINARY(16) PRIMARY KEY,
    queue VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSON NOT NULL,
    error TEXT NOT NULL,
    retry_count INT NOT NULL DEFAULT 0,
    status ENUM('FAILED', 'REPLAYED', 'DISCARDED') NOT NULL DEFAULT 'FAILED',
    resolved_by BINARY(16) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_dead_letter_queue (queue),
    INDEX idx_dead_letter_status (status),
    INDEX idx_dead_letter_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- AUDIT_LOGS TABLE
-- ========================================
CREATE TABLE audit_logs (
    id BINARY(16) PRIMARY KEY,
    actor_id BINARY(16) NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255) NOT NULL,
    previous_value JSON NULL,
    new_value JSON NULL,
    request_id VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_logs_actor (actor_id),
    INDEX idx_audit_logs_action (action),
    INDEX idx_audit_logs_resource (resource, resource_id),
    INDEX idx_audit_logs_created (created_at),
    INDEX idx_audit_logs_request (request_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Application tables for store partners and drivers
-- These store application data during the approval process

-- ========================================
-- STORE_APPLICATIONS TABLE
-- ========================================
CREATE TABLE store_applications (
    id BINARY(16) PRIMARY KEY,
    applicant_user_id BINARY(16) NULL,

    -- Step 1: Applicant Information
    applicant_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    alternate_contact_number VARCHAR(20) NULL,
    preferred_contact_method VARCHAR(20) NOT NULL,
    applicant_notes VARCHAR(2000) NULL,

    -- Step 2: Store Information
    store_name VARCHAR(255) NOT NULL,
    store_contact_number VARCHAR(20) NOT NULL,
    store_email VARCHAR(255) NULL,
    store_address VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    province VARCHAR(255) NULL,
    postal_code VARCHAR(255) NULL,
    store_type VARCHAR(255) NULL,
    registration_number VARCHAR(255) NULL,
    store_description TEXT NULL,
    latitude DOUBLE NULL,
    longitude DOUBLE NULL,
    store_logo_url VARCHAR(500) NULL,

    -- Step 3: Business Documents
    business_registration_number VARCHAR(100) NULL,
    business_registration_type VARCHAR(100) NULL,
    has_business_registration_document BOOLEAN NULL,
    has_business_license BOOLEAN NULL,
    has_food_safety_certificate BOOLEAN NULL,
    additional_info TEXT NULL,

    -- Review Information
    status VARCHAR(255) NOT NULL DEFAULT 'PENDING_REVIEW',
    reviewed_by BINARY(16) NULL,
    reviewed_at TIMESTAMP NULL,
    review_notes TEXT NULL,

    -- Timestamps
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (applicant_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,

    INDEX idx_store_application_status (status),
    INDEX idx_store_application_email (email),
    INDEX idx_store_application_submitted (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- DRIVER_APPLICATIONS TABLE
-- ========================================
CREATE TABLE driver_applications (
    id BINARY(16) PRIMARY KEY,
    applicant_user_id BINARY(16) NULL,

    -- Step 1: Personal Information
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    emergency_contact_number VARCHAR(20) NULL,
    emergency_contact_name VARCHAR(255) NULL,
    address VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    preferred_contact_method VARCHAR(20) NOT NULL,
    notes TEXT NULL,

    -- Step 2: Vehicle Information
    vehicle_type VARCHAR(50) NOT NULL,
    vehicle_make VARCHAR(100) NULL,
    vehicle_model VARCHAR(100) NULL,
    vehicle_year INT NULL,
    vehicle_registration_number VARCHAR(100) NOT NULL,
    vehicle_color VARCHAR(50) NULL,

    -- Step 3: License & Documents
    license_number VARCHAR(100) NOT NULL,
    license_issuing_authority VARCHAR(100) NULL,
    license_expiry_date VARCHAR(20) NULL,
    has_drivers_license BOOLEAN NULL,
    has_vehicle_registration BOOLEAN NULL,
    has_insurance_document BOOLEAN NULL,
    has_profile_photo BOOLEAN NULL,
    has_vehicle_photo BOOLEAN NULL,

    -- Step 4: Background & Availability
    has_delivery_experience BOOLEAN NULL,
    previous_delivery_experience TEXT NULL,
    availability VARCHAR(100) NOT NULL,
    preferred_areas VARCHAR(500) NULL,
    agreed_to_terms BOOLEAN NULL,
    additional_info TEXT NULL,

    -- Review Information
    status VARCHAR(255) NOT NULL DEFAULT 'PENDING_REVIEW',
    reviewed_by BINARY(16) NULL,
    reviewed_at TIMESTAMP NULL,
    review_notes TEXT NULL,

    -- Timestamps
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (applicant_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,

    INDEX idx_driver_application_status (status),
    INDEX idx_driver_application_email (email),
    INDEX idx_driver_application_submitted (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- APPLICATION_DOCUMENTS TABLE
-- ========================================
-- Stores uploaded documents for applications
CREATE TABLE application_documents (
    id BINARY(16) PRIMARY KEY,
    application_id BINARY(16) NOT NULL,
    application_type VARCHAR(255) NOT NULL,
    document_type VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    storage_key VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    content_type VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uk_application_documents_storage_key (storage_key),
    INDEX idx_application_document_owner (application_type, application_id),
    INDEX idx_application_documents_type (document_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- APPLICATION_REVIEW_HISTORY TABLE
-- ========================================
-- Tracks review history for applications
CREATE TABLE application_review_history (
    id BINARY(16) PRIMARY KEY,
    application_id BINARY(16) NOT NULL,
    application_type VARCHAR(255) NOT NULL,
    reviewed_by BINARY(16) NULL,
    previous_status VARCHAR(255) NULL,
    new_status VARCHAR(255) NOT NULL,
    note TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE RESTRICT,

    INDEX idx_application_history_owner (application_type, application_id),
    INDEX idx_application_review_history_reviewer (reviewed_by),
    INDEX idx_application_review_history_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
