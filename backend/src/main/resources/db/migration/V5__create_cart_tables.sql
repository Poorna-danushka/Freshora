-- Freshora Database Schema V5
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
