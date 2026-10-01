CREATE TABLE orders (
    id CHAR(36) NOT NULL,
    order_number VARCHAR(255) NOT NULL,
    customer_id BIGINT NOT NULL,
    store_id CHAR(36) NOT NULL,
    address_id BIGINT NOT NULL,
    address_snapshot JSON NOT NULL,
    status VARCHAR(255) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    delivery_fee DECIMAL(12,2) NOT NULL,
    discount_amount DECIMAL(12,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    commission_rate DECIMAL(7,4) NOT NULL,
    commission_amount DECIMAL(12,2) NOT NULL,
    store_amount DECIMAL(12,2) NOT NULL,
    version INT NOT NULL,
    created_at DATETIME(6) NOT NULL,
    cancelled_at DATETIME(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_orders_order_number (order_number),
    KEY idx_orders_customer_created (customer_id, created_at),
    KEY idx_orders_store_status (store_id, status),
    CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES users (id),
    CONSTRAINT fk_orders_address FOREIGN KEY (address_id) REFERENCES addresses (id)
) ENGINE=InnoDB;

CREATE TABLE order_items (
    id CHAR(36) NOT NULL,
    order_id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
    substitute_product_id CHAR(36),
    product_name VARCHAR(255) NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    quantity INT NOT NULL,
    line_total DECIMAL(12,2) NOT NULL,
    pick_status VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_order_items_order (order_id),
    KEY idx_order_items_product (product_id),
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (id)
) ENGINE=InnoDB;

CREATE TABLE order_events (
    id CHAR(36) NOT NULL,
    order_id CHAR(36) NOT NULL,
    event_type VARCHAR(255) NOT NULL,
    from_status VARCHAR(255),
    to_status VARCHAR(255) NOT NULL,
    version INT NOT NULL,
    payload JSON NOT NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_order_events_order_version (order_id, version),
    CONSTRAINT fk_order_events_order FOREIGN KEY (order_id) REFERENCES orders (id)
) ENGINE=InnoDB;

CREATE TABLE idempotency_records (
    id CHAR(36) NOT NULL,
    idem_key VARCHAR(255) NOT NULL,
    user_id BIGINT NOT NULL,
    operation VARCHAR(255) NOT NULL,
    request_hash VARCHAR(255) NOT NULL,
    status VARCHAR(255) NOT NULL,
    response JSON,
    order_id CHAR(36),
    expires_at DATETIME(6) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_idempotency_user_key_operation (user_id, idem_key, operation),
    KEY idx_idempotency_order (order_id),
    CONSTRAINT fk_idempotency_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_idempotency_order FOREIGN KEY (order_id) REFERENCES orders (id)
) ENGINE=InnoDB;

CREATE TABLE outbox_events (
    id CHAR(36) NOT NULL,
    aggregate_type VARCHAR(255) NOT NULL,
    aggregate_id CHAR(36) NOT NULL,
    event_type VARCHAR(255) NOT NULL,
    version INT NOT NULL,
    payload JSON NOT NULL,
    status VARCHAR(255) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    published_at DATETIME(6),
    attempts INT NOT NULL,
    last_error VARCHAR(255),
    PRIMARY KEY (id),
    KEY idx_outbox_status_created (status, created_at)
) ENGINE=InnoDB;

CREATE TABLE payments (
    id CHAR(36) NOT NULL,
    order_id CHAR(36) NOT NULL,
    status VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(255) NOT NULL,
    provider_ref VARCHAR(255),
    idempotency_key VARCHAR(255),
    attempts INT NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_payments_provider_ref (provider_ref),
    UNIQUE KEY uk_payments_idempotency_key (idempotency_key),
    KEY idx_payments_order (order_id),
    CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders (id)
) ENGINE=InnoDB;
