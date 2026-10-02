-- Freshora Database Schema V12
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
