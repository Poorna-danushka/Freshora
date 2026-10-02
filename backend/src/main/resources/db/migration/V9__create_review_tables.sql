-- Freshora Database Schema V9
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
