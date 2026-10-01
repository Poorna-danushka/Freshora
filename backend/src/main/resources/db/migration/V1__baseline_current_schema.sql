CREATE TABLE users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    profile_image_url VARCHAR(500),
    role VARCHAR(255) NOT NULL,
    enabled BOOLEAN NOT NULL,
    status VARCHAR(255) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_users_email UNIQUE (email)
) ENGINE=InnoDB;

CREATE TABLE addresses (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    label VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(255) NOT NULL,
    district VARCHAR(255) NOT NULL,
    postal_code VARCHAR(255),
    latitude DOUBLE,
    longitude DOUBLE,
    is_default BOOLEAN NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_address_user_default (user_id, is_default),
    KEY idx_address_user_created (user_id, created_at),
    CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB;

CREATE TABLE refresh_tokens (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    token_id VARCHAR(255) NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    revoked_at DATETIME(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_refresh_token_token_id (token_id),
    KEY idx_refresh_token_user (user_id),
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB;

CREATE TABLE password_reset_tokens (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(512) NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    used_at DATETIME(6),
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_password_reset_tokens_user (user_id),
    CONSTRAINT fk_password_reset_tokens_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB;

CREATE TABLE account_setup_tokens (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(512) NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    used_at DATETIME(6),
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_account_setup_tokens_user (user_id),
    CONSTRAINT fk_account_setup_tokens_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB;

CREATE TABLE store_applications (
    id BIGINT NOT NULL AUTO_INCREMENT,
    applicant_user_id BIGINT,
    applicant_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    contact_number VARCHAR(255) NOT NULL,
    alternate_contact_number VARCHAR(255),
    preferred_contact_method VARCHAR(255) NOT NULL,
    applicant_notes VARCHAR(2000),
    store_name VARCHAR(255) NOT NULL,
    store_contact_number VARCHAR(255) NOT NULL,
    store_email VARCHAR(255),
    store_address VARCHAR(1000) NOT NULL,
    city VARCHAR(255) NOT NULL,
    province VARCHAR(255),
    postal_code VARCHAR(255),
    store_type VARCHAR(255) NOT NULL,
    registration_number VARCHAR(255),
    store_description VARCHAR(4000),
    status VARCHAR(255) NOT NULL,
    reviewed_by BIGINT,
    reviewed_at DATETIME(6),
    review_notes VARCHAR(4000),
    submitted_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_store_application_status (status),
    KEY idx_store_application_email (email),
    CONSTRAINT fk_store_applications_applicant FOREIGN KEY (applicant_user_id) REFERENCES users (id),
    CONSTRAINT fk_store_applications_reviewer FOREIGN KEY (reviewed_by) REFERENCES users (id)
) ENGINE=InnoDB;

CREATE TABLE driver_applications (
    id BIGINT NOT NULL AUTO_INCREMENT,
    applicant_user_id BIGINT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    contact_number VARCHAR(255) NOT NULL,
    date_of_birth VARCHAR(255) NOT NULL,
    address VARCHAR(1000) NOT NULL,
    city VARCHAR(255) NOT NULL,
    province VARCHAR(255),
    emergency_contact_name VARCHAR(255),
    emergency_contact_number VARCHAR(255),
    vehicle_type VARCHAR(255) NOT NULL,
    vehicle_registration_number VARCHAR(255) NOT NULL,
    vehicle_make VARCHAR(255),
    vehicle_model VARCHAR(255),
    vehicle_year VARCHAR(255),
    vehicle_color VARCHAR(255),
    ownership_type VARCHAR(255) NOT NULL,
    preferred_area VARCHAR(255) NOT NULL,
    preferred_working_days VARCHAR(1000),
    preferred_working_hours VARCHAR(255),
    delivery_experience VARCHAR(2000),
    has_smartphone BOOLEAN NOT NULL,
    has_delivery_bag BOOLEAN,
    additional_notes VARCHAR(2000),
    status VARCHAR(255) NOT NULL,
    reviewed_by BIGINT,
    reviewed_at DATETIME(6),
    review_notes VARCHAR(4000),
    submitted_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_driver_application_status (status),
    KEY idx_driver_application_email (email),
    CONSTRAINT fk_driver_applications_applicant FOREIGN KEY (applicant_user_id) REFERENCES users (id),
    CONSTRAINT fk_driver_applications_reviewer FOREIGN KEY (reviewed_by) REFERENCES users (id)
) ENGINE=InnoDB;

CREATE TABLE application_documents (
    id BIGINT NOT NULL AUTO_INCREMENT,
    application_type VARCHAR(255) NOT NULL,
    application_id BIGINT NOT NULL,
    document_type VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    storage_key VARCHAR(255) NOT NULL,
    content_type VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    uploaded_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_application_documents_storage_key (storage_key),
    KEY idx_application_document_owner (application_type, application_id)
) ENGINE=InnoDB;

CREATE TABLE application_review_history (
    id BIGINT NOT NULL AUTO_INCREMENT,
    application_type VARCHAR(255) NOT NULL,
    application_id BIGINT NOT NULL,
    previous_status VARCHAR(255),
    new_status VARCHAR(255) NOT NULL,
    reviewed_by BIGINT,
    note VARCHAR(4000),
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_application_history_owner (application_type, application_id),
    CONSTRAINT fk_application_review_history_reviewer FOREIGN KEY (reviewed_by) REFERENCES users (id)
) ENGINE=InnoDB;
