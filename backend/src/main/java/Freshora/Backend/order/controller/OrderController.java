package Freshora.Backend.order.controller;

import Freshora.Backend.order.dto.CreateOrderRequest;
import Freshora.Backend.order.dto.OrderResponse;
import Freshora.Backend.order.service.OrderService;
import Freshora.Backend.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('CUSTOMER')")
    public OrderResponse createOrder(
            @AuthenticationPrincipal User customer,
            @RequestHeader("Idempotency-Key") String idempotencyKey,
            @Valid @RequestBody CreateOrderRequest request) {
        return orderService.create(customer, idempotencyKey, request);
    }
}
