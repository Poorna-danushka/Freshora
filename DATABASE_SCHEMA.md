# Freshora Database Schema Documentation

## Quick Reference

**Database**: `MYSQL_DATABASE` (default: `freshora`)<br>
**Port**: `MYSQL_PORT` (default: `3307`)<br>
**User**: `MYSQL_USER` from `.env`<br>
**Migrations**: 12 Flyway migrations

---

## Migration Order

| Version | File | Tables Created | Purpose |
|---------|------|----------------|---------|
| V1 | create_base_tables | 5 | User authentication and authorization |
| V2 | create_store_tables | 3 | Store management |
| V3 | create_product_tables | 4 | Products, categories, coupons |
| V4 | create_inventory_tables | 3 | Stock management with reservations |
| V5 | create_cart_tables | 2 | Shopping carts |
| V6 | create_order_tables | 3 | Orders and order history |
| V7 | create_payment_tables | 3 | Payments and refunds |
| V8 | create_driver_delivery_tables | 4 | Delivery management |
| V9 | create_review_tables | 1 | Ratings and reviews |
| V10 | create_system_tables | 6 | System infrastructure |

---

## Complete Table List (37 Tables)

### Core User Tables (V1)
1. **users** - Main user accounts
2. **roles** - User roles (CUSTOMER, STORE_MANAGER, STORE_STAFF, DRIVER, ADMIN)
3. **user_roles** - User-to-role assignments
4. **auth_tokens** - JWT refresh, reset, verification tokens
5. **addresses** - User delivery addresses

### Store Management (V2)
6. **stores** - Store information
7. **store_hours** - Store operating hours
8. **store_staff** - Staff assignments

### Products & Coupons (V3)
9. **categories** - Product categories (hierarchical)
10. **products** - Store products
11. **coupons** - Discount coupons
12. **coupon_redemptions** - Coupon usage tracking

### Inventory Management (V4)
13. **inventory** - Stock levels
14. **inventory_reservations** - Reserved stock during checkout
15. **inventory_adjustments** - Stock adjustment audit trail

### Shopping Cart (V5)
16. **carts** - Customer shopping carts
17. **cart_items** - Items in carts

### Orders (V6)
18. **orders** - Customer orders
19. **order_items** - Items in orders (with substitution support)
20. **order_events** - Order history/state changes

### Payments (V7)
21. **payments** - Payment transactions
22. **payment_callbacks** - Payment provider webhooks
23. **refunds** - Refund transactions

### Delivery (V8)
24. **drivers** - Driver accounts
25. **deliveries** - Delivery assignments
26. **delivery_offers** - Delivery offers to drivers
27. **driver_locations** - GPS tracking

### Reviews (V9)
28. **reviews** - Customer reviews

### System Infrastructure (V10)
29. **idempotency_records** - Operation deduplication
30. **notifications** - Notification queue
31. **outbox_events** - Event sourcing outbox
32. **processed_events** - Event deduplication
33. **dead_letter_messages** - Failed message handling
34. **audit_logs** - System audit trail

---

## Key Relationships

### User → Roles
```
users (1) ←→ (*) user_roles (*) ←→ (1) roles
```

### User → Orders → Items
```
users (1) → (*) orders (1) → (*) order_items (*) → (1) products
```

### Store → Products → Inventory
```
stores (1) → (*) products (1) → (1) inventory
```

### Orders → Payments → Refunds
```
orders (1) → (*) payments (1) → (*) refunds
```

### Orders → Deliveries → Drivers
```
orders (1) → (1) deliveries (*) ← (1) drivers
```

### Inventory → Reservations
```
inventory (1) → (*) inventory_reservations (*) ← (1) orders
```

---

## Important Constraints

### Check Constraints
- `users.status` ∈ {ACTIVE, SUSPENDED, PENDING}
- `stores.status` ∈ {PENDING_APPROVAL, ACTIVE, TEMP_CLOSED, SUSPENDED, INACTIVE}
- `inventory.available_qty` >= 0
- `inventory.reserved_qty` >= 0
- `reviews.rating` BETWEEN 1 AND 5
- `store_hours.day_of_week` BETWEEN 0 AND 6

### Unique Constraints
- `users.email` - Unique email per user
- `users.phone` - Unique phone per user
- `stores.manager_id` - One store per manager (currently)
- `store_staff.(store_id, user_id)` - Unique staff assignment
- `cart_items.(cart_id, product_id)` - One product per cart
- `order_events.(order_id, version)` - Sequential event versioning
- `coupon_redemptions.order_id` - One coupon per order
- `deliveries.order_id` - One delivery per order
- `drivers.user_id` - One driver account per user

### Cascading Deletes
- Delete user → Delete auth_tokens, addresses, carts
- Delete store → Delete products, inventory, store_hours, store_staff
- Delete product → Delete inventory, cart_items
- Delete order → Delete order_items, order_events, payments, deliveries
- Delete delivery → Delete delivery_offers, driver_locations

---

## Optimistic Locking (Version Control)

These tables use version fields to prevent race conditions:

- **inventory.version** - Prevents overselling
- **orders.version** - Prevents concurrent order modifications
- **deliveries.version** - Prevents double assignment
- **products.version** - Tracks product changes

---

## Indexes for Performance

### Lookup Indexes
- `users`: email, phone, status
- `products`: store_id, category_id, status, name
- `orders`: customer_id, store_id, status, order_number, created_at
- `drivers`: user_id, status, application_status, rating
- `deliveries`: order_id, driver_id, status

### Geographic Indexes
- `addresses`: (latitude, longitude)
- `stores`: (latitude, longitude)
- `driver_locations`: (latitude, longitude)

### Time-Series Indexes
- `auth_tokens`: expires_at
- `inventory_reservations`: expires_at
- `order_events`: created_at
- `audit_logs`: created_at
- `driver_locations`: recorded_at

### Composite Indexes
- `store_hours`: (store_id, day_of_week)
- `cart_items`: (cart_id, product_id)
- `order_events`: (order_id, version)
- `inventory`: (low_stock_threshold, available_qty)

---

## JSON Fields

Several tables use JSON for flexible data:

- **orders.address_snapshot** - Delivery address at order time
- **order_events.payload** - Event-specific data
- **notifications.payload** - Notification content
- **outbox_events.payload** - Event data
- **payment_callbacks.payload** - Provider webhook data
- **audit_logs.previous_value** - Old state
- **audit_logs.new_value** - New state
- **idempotency_records.response** - Operation result
- **dead_letter_messages.payload** - Failed message data

---

## Enum Values Reference

### user.status
- ACTIVE - Normal active user
- SUSPENDED - Account suspended
- PENDING - Email not verified

### store.status
- PENDING_APPROVAL - Awaiting admin approval
- ACTIVE - Operating normally
- TEMP_CLOSED - Temporarily closed
- SUSPENDED - Admin suspended
- INACTIVE - Permanently closed

### order.status
- PENDING - Order placed, awaiting confirmation
- CONFIRMED - Store confirmed order
- PREPARING - Store is preparing items
- READY_FOR_PICKUP - Ready for driver pickup
- OUT_FOR_DELIVERY - Driver has order
- DELIVERED - Successfully delivered
- CANCELLED - Order cancelled
- REFUNDED - Order refunded

### order_item.pick_status
- PENDING - Not picked yet
- PICKED - Item picked
- UNAVAILABLE - Item out of stock
- SUBSTITUTED - Substituted with alternate

### driver.status
- OFFLINE - Not accepting deliveries
- AVAILABLE - Ready for deliveries
- BUSY - Has delivery but not started
- ON_DELIVERY - Actively delivering
- SUSPENDED - Account suspended

### driver.application_status
- PENDING - Application submitted
- APPROVED - Application approved
- REJECTED - Application rejected

### delivery.status
- AVAILABLE - Awaiting driver assignment
- ASSIGNED - Driver assigned
- PICKED_UP - Driver picked up order
- IN_TRANSIT - In transit to customer
- DELIVERED - Delivered to customer
- CANCELLED - Delivery cancelled

### payment.status
- PENDING - Payment initiated
- PROCESSING - Processing with provider
- SUCCESS - Payment successful
- FAILED - Payment failed
- REFUNDED - Payment refunded

### notification.channel
- IN_APP - In-app notification
- EMAIL - Email notification
- PUSH - Push notification

### notification.status
- PENDING - Queued for sending
- SENT - Successfully sent
- FAILED - Failed to send
- DEAD - Max retries exceeded

---

## Sample Queries

### Get user with all roles
```sql
SELECT u.*, GROUP_CONCAT(r.name) as roles
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'user@example.com'
GROUP BY u.id;
```

### Get store with active products
```sql
SELECT s.name as store_name, p.name as product_name, p.price, i.available_qty
FROM stores s
JOIN products p ON s.id = p.store_id
JOIN inventory i ON p.id = i.product_id
WHERE s.status = 'ACTIVE'
  AND p.status = 'ACTIVE'
  AND i.available_qty > 0;
```

### Get order with full details
```sql
SELECT
    o.order_number,
    o.status,
    u.name as customer_name,
    s.name as store_name,
    o.total_amount,
    GROUP_CONCAT(CONCAT(oi.product_name, ' x', oi.quantity)) as items
FROM orders o
JOIN users u ON o.customer_id = u.id
JOIN stores s ON o.store_id = s.id
JOIN order_items oi ON o.id = oi.order_id
WHERE o.order_number = 'ORD-12345'
GROUP BY o.id;
```

### Get active drivers with current delivery
```sql
SELECT
    u.name as driver_name,
    d.status as driver_status,
    d.rating_avg,
    o.order_number,
    del.status as delivery_status
FROM drivers d
JOIN users u ON d.user_id = u.id
LEFT JOIN deliveries del ON d.id = del.driver_id AND del.status IN ('ASSIGNED', 'PICKED_UP', 'IN_TRANSIT')
LEFT JOIN orders o ON del.order_id = o.id
WHERE d.status IN ('AVAILABLE', 'ON_DELIVERY');
```

### Check inventory across stores
```sql
SELECT
    p.name as product_name,
    s.name as store_name,
    i.available_qty,
    i.reserved_qty,
    (i.available_qty - i.low_stock_threshold) as stock_buffer
FROM inventory i
JOIN products p ON i.product_id = p.id
JOIN stores s ON i.store_id = s.id
WHERE i.available_qty < i.low_stock_threshold
ORDER BY stock_buffer ASC;
```

---

## Database Reset Instructions

### Windows (PowerShell)
```powershell
.\reset-database.ps1
```

### Linux/Mac (Bash)
```bash
chmod +x reset-database.sh
./reset-database.sh
```

### Manual Reset
```bash
# Stop everything and remove volumes
docker compose down -v

# Start fresh
docker compose up -d --build

# View migration logs
docker compose logs -f backend
```

---

## Maintenance Commands

### View Flyway Migration History
```sql
SELECT installed_rank, version, description, type, installed_on, execution_time, success
FROM flyway_schema_history
ORDER BY installed_rank;
```

### Get Table Sizes
```sql
SELECT
    table_name,
    table_rows,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS "Size (MB)"
FROM information_schema.tables
WHERE table_schema = 'freshora'
ORDER BY (data_length + index_length) DESC;
```

### Check Foreign Key Constraints
```sql
SELECT
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE REFERENCED_TABLE_SCHEMA = 'freshora'
ORDER BY TABLE_NAME, COLUMN_NAME;
```

### Find Tables Without Primary Key
```sql
SELECT t.table_name
FROM information_schema.tables t
LEFT JOIN information_schema.table_constraints tc
    ON t.table_name = tc.table_name
    AND tc.constraint_type = 'PRIMARY KEY'
WHERE t.table_schema = 'freshora'
    AND tc.constraint_name IS NULL
    AND t.table_type = 'BASE TABLE';
```

---

## Backup and Restore

### Backup Database
```bash
docker compose exec mysql mysqldump -u root -p freshora > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database
```bash
docker compose exec -T mysql mysql -u root -p freshora < backup_20240101_120000.sql
```

### Export Specific Table
```bash
docker compose exec mysql mysqldump -u root -p freshora users > users_backup.sql
```

---

## Troubleshooting

### Migration Failed
```bash
# Check Flyway history
docker compose exec mysql mysql -u root -p freshora -e "SELECT * FROM flyway_schema_history;"

# View backend logs
docker compose logs backend | grep -i flyway
```

### Foreign Key Errors
```bash
# Check FK constraints
docker compose exec mysql mysql -u root -p freshora -e "
SELECT * FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE REFERENCED_TABLE_SCHEMA = 'freshora';
"
```

### Performance Issues
```sql
-- Check slow queries
SHOW PROCESSLIST;

-- Check index usage
SHOW INDEX FROM orders;

-- Analyze table
ANALYZE TABLE orders;
```

---

## Contact & Support

For database schema questions or issues:
1. Check this documentation
2. Review migration files in `backend/src/main/resources/db/migration/`
3. Check Docker logs: `docker compose logs -f backend`
4. Access MySQL directly: `docker compose exec mysql mysql -u danushka -p freshora`
