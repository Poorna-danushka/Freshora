-- 1. Fix the role ENUM to match all application roles
ALTER TABLE users MODIFY COLUMN role ENUM(
  'CUSTOMER',
  'STORE_MANAGER',
  'STORE_STAFF',
  'DELIVERY_RIDER',
  'ADMIN'
) NOT NULL;

-- 2. Restore roles + fix BCrypt hashes ($2a$ prefix, Spring-compatible)
UPDATE users SET
  role = 'CUSTOMER',
  password = '$2a$10$Fn1PQ4/utqgL8iS0oWtuauEEvcsY6eMJH2LrSeulhPtTH2Su1IUTa',
  enabled = 1
WHERE email = 'customer@freshora.test';

UPDATE users SET
  role = 'STORE_MANAGER',
  password = '$2a$10$1IAjxOblbNLW3Dv1wtngPO2VnsT75OhaUtCWaA/YpC/Y5bEVHy4UK',
  enabled = 1
WHERE email = 'store.manager@freshora.test';

UPDATE users SET
  role = 'STORE_STAFF',
  password = '$2a$10$1IAjxOblbNLW3Dv1wtngPO2VnsT75OhaUtCWaA/YpC/Y5bEVHy4UK',
  enabled = 1
WHERE email = 'store.staff@freshora.test';

UPDATE users SET
  role = 'DELIVERY_RIDER',
  password = '$2a$10$1IAjxOblbNLW3Dv1wtngPO2VnsT75OhaUtCWaA/YpC/Y5bEVHy4UK',
  enabled = 1
WHERE email = 'delivery.rider@freshora.test';

UPDATE users SET
  role = 'ADMIN',
  password = '$2a$10$1IAjxOblbNLW3Dv1wtngPO2VnsT75OhaUtCWaA/YpC/Y5bEVHy4UK',
  enabled = 1
WHERE email = 'admin@freshora.test';

-- 3. Verify
SELECT email, LEFT(password,7) AS hash_ok, role, enabled FROM users ORDER BY id;
