-- Freshora Database Schema V10
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
