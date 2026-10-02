-- Freshora Database Schema V7
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
