package Freshora.Backend.order.service;

import Freshora.Backend.exception.ConflictException;
import Freshora.Backend.exception.ResourceNotFoundException;
import Freshora.Backend.order.catalog.CatalogPort;
import Freshora.Backend.order.dto.CreateOrderRequest;
import Freshora.Backend.order.dto.OrderResponse;
import Freshora.Backend.order.entity.*;
import Freshora.Backend.order.repository.*;
import Freshora.Backend.user.entity.Address;
import Freshora.Backend.user.entity.User;
import Freshora.Backend.user.repository.AddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
public class OrderService {
    private static final String OPERATION = "CREATE_ORDER";
    private static final BigDecimal ZERO = new BigDecimal("0.00");

    private final CatalogPort catalogPort;
    private final AddressRepository addressRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderEventRepository orderEventRepository;
    private final IdempotencyRecordRepository idempotencyRecordRepository;
    private final OutboxEventRepository outboxEventRepository;
    private final ObjectMapper objectMapper;
    private final TransactionTemplate transactionTemplate;

    @Value("${freshora.orders.idempotency-retention:PT24H}")
    private Duration idempotencyRetention;

    public OrderResponse create(User customer, String idempotencyKey, CreateOrderRequest request) {
        if (idempotencyKey == null || idempotencyKey.isBlank() || idempotencyKey.length() > 255) {
            throw new IllegalArgumentException("Idempotency-Key is required and must be at most 255 characters");
        }

        String normalizedCoupon = normalizeCoupon(request.couponCode());
        String requestHash = requestHash(request, normalizedCoupon);
        Optional<IdempotencyRecord> existing = idempotencyRecordRepository
                .findByUser_IdAndIdemKeyAndOperation(customer.getId(), idempotencyKey, OPERATION);
        if (existing.isPresent() && existing.get().getExpiresAt().isAfter(Instant.now())) {
            return replayOrConflict(existing.get(), requestHash);
        }

        Address address = addressRepository.findByUserAndId(customer, request.addressId())
                .orElseThrow(() -> new ResourceNotFoundException("Delivery address not found"));
        List<CatalogPort.RequestedProduct> requestedProducts = request.items().stream()
                .map(item -> new CatalogPort.RequestedProduct(item.productId(), item.quantity()))
                .toList();
        CatalogPort.CatalogQuote quote = catalogPort.quote(request.storeId(), requestedProducts, normalizedCoupon);
        Map<UUID, CatalogPort.ProductQuote> products = validateQuote(request, quote);

        try {
            return transactionTemplate.execute(status -> createInTransaction(
                    customer, address, idempotencyKey, requestHash, normalizedCoupon, request, quote, products));
        } catch (DataIntegrityViolationException ex) {
            Optional<IdempotencyRecord> racedRecord = idempotencyRecordRepository
                    .findByUser_IdAndIdemKeyAndOperation(customer.getId(), idempotencyKey, OPERATION);
            if (racedRecord.isPresent() && racedRecord.get().getExpiresAt().isAfter(Instant.now())) {
                return replayOrConflict(racedRecord.get(), requestHash);
            }
            throw ex;
        }
    }

    private OrderResponse createInTransaction(
            User customer,
            Address address,
            String idempotencyKey,
            String requestHash,
            String normalizedCoupon,
            CreateOrderRequest request,
            CatalogPort.CatalogQuote quote,
            Map<UUID, CatalogPort.ProductQuote> products) {
        Instant now = Instant.now();
        Optional<IdempotencyRecord> existing = idempotencyRecordRepository
                .findByUser_IdAndIdemKeyAndOperation(customer.getId(), idempotencyKey, OPERATION);
        if (existing.isPresent()) {
            if (existing.get().getExpiresAt().isAfter(now)) {
                return replayOrConflict(existing.get(), requestHash);
            }
            idempotencyRecordRepository.delete(existing.get());
            idempotencyRecordRepository.flush();
        }

        BigDecimal subtotal = request.items().stream()
                .map(item -> money(products.get(item.productId()).unitPrice())
                        .multiply(BigDecimal.valueOf(item.quantity())))
                .reduce(ZERO, BigDecimal::add);
        BigDecimal deliveryFee = money(quote.deliveryFee());
        BigDecimal discountAmount = money(quote.discountAmount());
        if (discountAmount.compareTo(subtotal) > 0) {
            throw new IllegalStateException("Catalog returned a discount greater than the item subtotal");
        }
        BigDecimal totalAmount = subtotal.add(deliveryFee).subtract(discountAmount);
        if (quote.commissionRate().scale() > 4 || quote.commissionRate().precision() > 7) {
            throw new IllegalStateException("Catalog returned a commission rate outside the supported precision");
        }
        BigDecimal commissionRate = quote.commissionRate().setScale(4, RoundingMode.HALF_UP);
        BigDecimal commissionBase = subtotal.subtract(discountAmount);
        BigDecimal commissionAmount = commissionBase.multiply(commissionRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal storeAmount = commissionBase.subtract(commissionAmount);

        Order order = orderRepository.saveAndFlush(Order.builder()
                .orderNumber("FO-" + UUID.randomUUID())
                .customer(customer)
                .storeId(request.storeId())
                .address(address)
                .addressSnapshot(addressSnapshot(address))
                .status(OrderStatus.CREATED)
                .subtotal(subtotal)
                .deliveryFee(deliveryFee)
                .discountAmount(discountAmount)
                .totalAmount(totalAmount)
                .commissionRate(commissionRate)
                .commissionAmount(commissionAmount)
                .storeAmount(storeAmount)
                .version(1)
                .build());

        List<OrderItem> orderItems = request.items().stream()
                .map(item -> {
                    CatalogPort.ProductQuote product = products.get(item.productId());
                    BigDecimal unitPrice = money(product.unitPrice());
                    return OrderItem.builder()
                            .order(order)
                            .productId(product.productId())
                            .productName(product.productName())
                            .unitPrice(unitPrice)
                            .quantity(item.quantity())
                            .lineTotal(unitPrice.multiply(BigDecimal.valueOf(item.quantity())))
                            .pickStatus(OrderItem.PickStatus.PENDING)
                            .build();
                })
                .toList();
        orderItemRepository.saveAllAndFlush(orderItems);

        OrderResponse response = OrderResponseMapper.toResponse(order, orderItems);
        IdempotencyRecord record = IdempotencyRecord.builder()
                .idemKey(idempotencyKey)
                .user(customer)
                .operation(OPERATION)
                .requestHash(requestHash)
                .status(IdempotencyStatus.IN_PROGRESS)
                .order(order)
                .expiresAt(now.plus(idempotencyRetention))
                .build();
        idempotencyRecordRepository.save(record);

        Map<String, Object> eventPayload = new LinkedHashMap<>();
        eventPayload.put("orderId", order.getId().toString());
        eventPayload.put("orderNumber", order.getOrderNumber());
        eventPayload.put("customerId", customer.getId());
        eventPayload.put("storeId", order.getStoreId().toString());
        eventPayload.put("addressId", address.getId());
        eventPayload.put("status", order.getStatus().name());
        eventPayload.put("paymentMethod", request.paymentMethod().name());
        eventPayload.put("couponCode", normalizedCoupon);

        orderEventRepository.save(OrderEvent.builder()
                .order(order)
                .eventType("OrderCreated")
                .toStatus(OrderStatus.CREATED.name())
                .version(order.getVersion())
                .payload(eventPayload)
                .build());
        outboxEventRepository.save(OutboxEvent.builder()
                .aggregateType("ORDER")
                .aggregateId(order.getId())
                .eventType("OrderCreated")
                .version(order.getVersion())
                .payload(eventPayload)
                .status(OutboxEvent.OutboxStatus.PENDING)
                .attempts(0)
                .build());

        record.setResponse(objectMapper.convertValue(response, new TypeReference<>() {}));
        record.setStatus(IdempotencyStatus.COMPLETED);
        return response;
    }

    private Map<UUID, CatalogPort.ProductQuote> validateQuote(
            CreateOrderRequest request, CatalogPort.CatalogQuote quote) {
        if (quote == null || !quote.storeActive() || !quote.storeOpen()) {
            throw new ConflictException("Store is not currently accepting orders");
        }
        if (quote.deliveryFee() == null || quote.commissionRate() == null || quote.discountAmount() == null) {
            throw new IllegalStateException("Catalog returned an incomplete price quote");
        }
        if (quote.products() == null || quote.products().size() != request.items().size()) {
            throw new IllegalStateException("Catalog returned an incomplete product quote");
        }

        Map<UUID, CatalogPort.ProductQuote> productById = new HashMap<>();
        for (CatalogPort.ProductQuote product : quote.products()) {
            if (product == null || product.productId() == null || productById.put(product.productId(), product) != null) {
                throw new IllegalStateException("Catalog returned duplicate or invalid product data");
            }
        }
        for (CreateOrderRequest.Item item : request.items()) {
            CatalogPort.ProductQuote product = productById.get(item.productId());
            if (product == null || !product.active()) {
                throw new ConflictException("A requested product is unavailable");
            }
            if (product.availableQuantity() < item.quantity()) {
                throw new ConflictException("A requested product has insufficient available inventory");
            }
            if (product.productName() == null || product.productName().isBlank()
                    || product.unitPrice() == null || product.unitPrice().signum() < 0) {
                throw new IllegalStateException("Catalog returned invalid product pricing");
            }
        }
        if (quote.deliveryFee().signum() < 0 || quote.discountAmount().signum() < 0
                || quote.commissionRate().signum() < 0 || quote.commissionRate().scale() > 4) {
            throw new IllegalStateException("Catalog returned invalid pricing values");
        }
        return productById;
    }

    private OrderResponse replayOrConflict(IdempotencyRecord record, String requestHash) {
        if (!record.getRequestHash().equals(requestHash)) {
            throw new ConflictException("Idempotency-Key was already used with a different request");
        }
        if (record.getStatus() != IdempotencyStatus.COMPLETED || record.getResponse() == null) {
            throw new ConflictException("An order request with this Idempotency-Key is still in progress");
        }
        OrderResponse response = objectMapper.convertValue(record.getResponse(), OrderResponse.class);
        return new OrderResponse(response.id(), response.orderNumber(), response.status(),
                response.subtotal().setScale(2, RoundingMode.UNNECESSARY),
                response.deliveryFee().setScale(2, RoundingMode.UNNECESSARY),
                response.discountAmount().setScale(2, RoundingMode.UNNECESSARY),
                response.totalAmount().setScale(2, RoundingMode.UNNECESSARY),
                response.version(), response.createdAt(),
                response.items().stream().map(item -> new OrderResponse.Item(
                        item.productId(), item.productName(),
                        item.unitPrice().setScale(2, RoundingMode.UNNECESSARY), item.quantity(),
                        item.lineTotal().setScale(2, RoundingMode.UNNECESSARY))).toList());
    }

    private String requestHash(CreateOrderRequest request, String couponCode) {
        List<CreateOrderRequest.Item> sortedItems = request.items().stream()
                .sorted(Comparator.comparing(item -> item.productId().toString()))
                .toList();
        Set<UUID> uniqueProducts = new HashSet<>();
        for (CreateOrderRequest.Item item : sortedItems) {
            if (!uniqueProducts.add(item.productId())) {
                throw new IllegalArgumentException("Each product may appear only once in an order request");
            }
        }

        StringBuilder canonical = new StringBuilder();
        append(canonical, request.storeId().toString());
        append(canonical, request.addressId().toString());
        append(canonical, couponCode == null ? "" : couponCode);
        append(canonical, request.paymentMethod().name());
        sortedItems.forEach(item -> {
            append(canonical, item.productId().toString());
            append(canonical, item.quantity().toString());
        });
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(canonical.toString().getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is unavailable", ex);
        }
    }

    private void append(StringBuilder target, String value) {
        target.append(value.length()).append(':').append(value);
    }

    private String normalizeCoupon(String couponCode) {
        return couponCode == null || couponCode.isBlank()
                ? null
                : couponCode.trim().toUpperCase(Locale.ROOT);
    }

    private BigDecimal money(BigDecimal value) {
        if (value == null || value.signum() < 0) {
            throw new IllegalStateException("Catalog returned an invalid monetary amount");
        }
        return value.setScale(2, RoundingMode.UNNECESSARY);
    }

    private Map<String, Object> addressSnapshot(Address address) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("recipientName", address.getRecipientName());
        snapshot.put("phone", address.getPhone());
        snapshot.put("line1", address.getAddressLine1());
        snapshot.put("line2", address.getAddressLine2());
        snapshot.put("city", address.getCity());
        snapshot.put("district", address.getDistrict());
        snapshot.put("postalCode", address.getPostalCode());
        snapshot.put("latitude", address.getLatitude());
        snapshot.put("longitude", address.getLongitude());
        return snapshot;
    }

}
