package Freshora.Backend.order.service;

import Freshora.Backend.exception.ConflictException;
import Freshora.Backend.exception.ResourceNotFoundException;
import Freshora.Backend.order.config.OrderLifecycleProperties;
import Freshora.Backend.order.dto.OrderResponse;
import Freshora.Backend.order.entity.Order;
import Freshora.Backend.order.entity.OrderEvent;
import Freshora.Backend.order.entity.OrderItem;
import Freshora.Backend.order.entity.OrderStatus;
import Freshora.Backend.order.entity.OutboxEvent;
import Freshora.Backend.order.repository.OrderEventRepository;
import Freshora.Backend.order.repository.OrderItemRepository;
import Freshora.Backend.order.repository.OrderRepository;
import Freshora.Backend.order.repository.OutboxEventRepository;
import Freshora.Backend.user.entity.Role;
import Freshora.Backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderLifecycleService {
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderEventRepository orderEventRepository;
    private final OutboxEventRepository outboxEventRepository;
    private final OrderLifecycleProperties lifecycleProperties;

    @Transactional(readOnly = true)
    public Page<OrderResponse> getCustomerOrders(User customer, Pageable pageable) {
        Page<Order> orders = orderRepository.findByCustomer_Id(customer.getId(), pageable);
        List<UUID> orderIds = orders.getContent().stream()
                .map(order -> Objects.requireNonNull(order.getId(), "Persisted order has no ID"))
                .toList();
        Map<UUID, List<OrderItem>> itemsByOrder = orderIds.isEmpty()
                ? Map.of()
                : orderItemRepository.findAllByOrder_IdIn(orderIds).stream()
                        .collect(Collectors.groupingBy(item -> item.getOrder().getId()));
        return orders.map(order -> OrderResponseMapper.toResponse(
                order, itemsByOrder.getOrDefault(order.getId(), List.of())));
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrder(UUID orderId, User actor) {
        Order order = findOrder(orderId);
        if (!isAdministrator(actor) && !Objects.equals(order.getCustomer().getId(), actor.getId())) {
            throw new ResourceNotFoundException("Order not found");
        }
        return toResponse(order);
    }

    @Transactional
    public OrderResponse transition(UUID orderId, OrderStatus targetStatus, int expectedVersion) {
        return transition(findOrder(orderId), targetStatus, expectedVersion);
    }

    @Transactional
    public OrderResponse cancel(UUID orderId, User customer, int expectedVersion) {
        Order order = findOrder(orderId);
        if (!Objects.equals(order.getCustomer().getId(), customer.getId())) {
            throw new ResourceNotFoundException("Order not found");
        }
        checkVersion(order, expectedVersion);
        if (!lifecycleProperties.getCancellableStates().contains(order.getStatus())) {
            throw new ConflictException("ORDER_CANCELLATION_NOT_ALLOWED",
                    "Order can no longer be cancelled");
        }
        return transition(order, OrderStatus.CANCELLED, expectedVersion);
    }

    private OrderResponse transition(Order order, OrderStatus targetStatus, int expectedVersion) {
        checkVersion(order, expectedVersion);
        OrderStatus fromStatus = order.getStatus();
        if (!fromStatus.canTransitionTo(targetStatus)) {
            throw new ConflictException("ORDER_INVALID_TRANSITION",
                    "Order cannot transition from " + fromStatus + " to " + targetStatus);
        }

        order.setStatus(targetStatus);
        if (targetStatus == OrderStatus.CANCELLED) {
            order.setCancelledAt(Instant.now());
        }
        orderRepository.saveAndFlush(order);

        int nextVersion = order.getVersion();
        Map<String, Object> payload = Map.of(
                "orderId", order.getId().toString(),
                "fromStatus", fromStatus.name(),
                "toStatus", targetStatus.name(),
                "version", nextVersion
        );
        orderEventRepository.save(OrderEvent.builder()
                .order(order)
                .eventType("OrderStatusChanged")
                .fromStatus(fromStatus.name())
                .toStatus(targetStatus.name())
                .version(nextVersion)
                .payload(payload)
                .build());
        outboxEventRepository.save(OutboxEvent.builder()
                .aggregateType("ORDER")
                .aggregateId(order.getId())
                .eventType("OrderStatusChanged")
                .version(nextVersion)
                .payload(payload)
                .status(OutboxEvent.OutboxStatus.PENDING)
                .attempts(0)
                .build());
        return toResponse(order);
    }

    private void checkVersion(Order order, int expectedVersion) {
        if (order.getVersion() != expectedVersion) {
            throw new ConflictException("ORDER_VERSION_CONFLICT",
                    "Order version does not match the current version");
        }
    }

    private Order findOrder(UUID orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
    }

    private boolean isAdministrator(User user) {
        return user.getRole() == Role.ADMIN;
    }

    private OrderResponse toResponse(Order order) {
        return OrderResponseMapper.toResponse(order, orderItemRepository.findAllByOrder_Id(order.getId()));
    }
}
