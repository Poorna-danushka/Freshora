INSERT IGNORE INTO users (first_name, last_name, email, password, role, enabled, created_at, updated_at)
VALUES
  -- password: FreshoraUser123!  (BCrypt $2a$10$, cost 10, Spring-compatible)
  ('Demo', 'Customer',       'customer@freshora.test',        '$2a$10$Fn1PQ4/utqgL8iS0oWtuauEEvcsY6eMJH2LrSeulhPtTH2Su1IUTa', 'CUSTOMER',       true, NOW(), NOW()),
  -- password: FreshoraAdmin123! (BCrypt $2a$10$, cost 10, Spring-compatible)
  ('Demo', 'Store Manager',  'store.manager@freshora.test',   '$2a$10$1IAjxOblbNLW3Dv1wtngPO2VnsT75OhaUtCWaA/YpC/Y5bEVHy4UK', 'STORE_MANAGER',  true, NOW(), NOW()),
  ('Demo', 'Store Staff',    'store.staff@freshora.test',     '$2a$10$1IAjxOblbNLW3Dv1wtngPO2VnsT75OhaUtCWaA/YpC/Y5bEVHy4UK', 'STORE_STAFF',    true, NOW(), NOW()),
  ('Demo', 'Delivery Rider', 'delivery.rider@freshora.test',  '$2a$10$1IAjxOblbNLW3Dv1wtngPO2VnsT75OhaUtCWaA/YpC/Y5bEVHy4UK', 'DELIVERY_RIDER', true, NOW(), NOW()),
  ('Demo', 'Admin',          'admin@freshora.test',           '$2a$10$1IAjxOblbNLW3Dv1wtngPO2VnsT75OhaUtCWaA/YpC/Y5bEVHy4UK', 'ADMIN',          true, NOW(), NOW());

