package Freshora.Backend.order.controller;

import Freshora.Backend.order.dto.CreateOrderRequest;
import Freshora.Backend.order.dto.CancelOrderRequest;
import Freshora.Backend.order.dto.OrderResponse;
import Freshora.Backend.order.dto.TransitionOrderRequest;
import Freshora.Backend.order.service.OrderLifecycleService;
import Freshora.Backend.order.service.OrderService;
import Freshora.Backend.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PagedModel;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;
    private final OrderLifecycleService orderLifecycleService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('CUSTOMER')")
    public OrderResponse createOrder(
            @AuthenticationPrincipal User customer,
            @RequestHeader("Idempotency-Key") String idempotencyKey,
            @Valid @RequestBody CreateOrderRequest request) {
        return orderService.create(customer, idempotencyKey, request);
    }

    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public PagedModel<OrderResponse> getOrders(
            @AuthenticationPrincipal User customer,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<OrderResponse> orders = orderLifecycleService.getCustomerOrders(customer, pageable);
        return new PagedModel<>(orders);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER','ADMIN')")
    public OrderResponse getOrder(@PathVariable UUID id, @AuthenticationPrincipal User actor) {
        return orderLifecycleService.getOrder(id, actor);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public OrderResponse transitionOrder(
            @PathVariable UUID id, @Valid @RequestBody TransitionOrderRequest request) {
        return orderLifecycleService.transition(id, request.targetStatus(), request.expectedVersion());
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    public OrderResponse cancelOrder(
            @PathVariable UUID id,
            @AuthenticationPrincipal User customer,
            @Valid @RequestBody CancelOrderRequest request) {
        return orderLifecycleService.cancel(id, customer, request.expectedVersion());
    }
}
