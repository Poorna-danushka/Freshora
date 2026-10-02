-- Freshora Database Schema V11
-- Add profile image support to the UUID-based users table.

ALTER TABLE users
    ADD COLUMN profile_image_url VARCHAR(500) NULL AFTER password_hash;
