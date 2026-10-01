package Freshora.Backend;

import Freshora.Backend.order.entity.Order;
import Freshora.Backend.order.entity.OrderEvent;
import Freshora.Backend.order.entity.OrderStatus;
import Freshora.Backend.order.repository.OrderEventRepository;
import Freshora.Backend.order.repository.OrderRepository;
import Freshora.Backend.order.repository.OutboxEventRepository;
import Freshora.Backend.user.entity.Address;
import Freshora.Backend.user.entity.Role;
import Freshora.Backend.user.entity.User;
import Freshora.Backend.user.repository.AddressRepository;
import Freshora.Backend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import tools.jackson.databind.json.JsonMapper;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.params.provider.Arguments.arguments;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.reset;

@SpringBootTest
@ActiveProfiles("test")
class OrderLifecycleApiTests {
    @Autowired
    private WebApplicationContext context;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private AddressRepository addressRepository;
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private OrderEventRepository orderEventRepository;
    @Autowired
    private OutboxEventRepository outboxEventRepository;
    @MockitoSpyBean
    private OutboxEventRepository outboxEventRepositorySpy;

    private MockMvc mockMvc;
    private User customer;
    private User admin;
    private Address address;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
        reset(outboxEventRepositorySpy);
        customer = saveUser(Role.CUSTOMER);
        admin = saveUser(Role.ADMIN);
        address = addressRepository.save(Address.builder()
                .user(customer)
                .label("Home")
                .recipientName("Lifecycle Customer")
                .phone("+94112223333")
                .addressLine1("1 Main Street")
                .city("Colombo")
                .district("Colombo")
                .isDefault(true)
                .build());
    }

    @ParameterizedTest
    @MethodSource("validTransitions")
    void everyAllowedTransitionWritesVersionedOrderAndOutboxEvents(
            OrderStatus fromStatus, OrderStatus toStatus) throws Exception {
        Order order = saveOrder(fromStatus, 1);
        mockMvc.perform(patch("/api/v1/orders/{id}/status", order.getId())
                        .with(user(admin))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(transitionBody(toStatus, 1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(toStatus.name()))
                .andExpect(jsonPath("$.version").value(2));

        Order updated = orderRepository.findById(order.getId()).orElseThrow();
        assertThat(updated.getStatus()).isEqualTo(toStatus);
        assertThat(updated.getVersion()).isEqualTo(2);
        OrderEvent event = orderEventRepository.findAll().stream()
                .filter(candidate -> candidate.getOrder().getId().equals(order.getId()))
                .findFirst().orElseThrow();
        assertThat(event.getFromStatus()).isEqualTo(fromStatus.name());
        assertThat(event.getToStatus()).isEqualTo(toStatus.name());
        assertThat(event.getVersion()).isEqualTo(2);
        assertThat(outboxEventRepository.countByAggregateId(order.getId())).isEqualTo(1);
    }

    @ParameterizedTest
    @MethodSource("invalidTransitions")
    void invalidTransitionsReturnConflictWithCodeAndRequestId(
            OrderStatus fromStatus, OrderStatus toStatus) throws Exception {
        Order order = saveOrder(fromStatus, 1);
        mockMvc.perform(patch("/api/v1/orders/{id}/status", order.getId())
                        .with(user(admin))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(transitionBody(toStatus, 1)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("ORDER_INVALID_TRANSITION"))
                .andExpect(jsonPath("$.requestId").isNotEmpty());

        assertThat(orderRepository.findById(order.getId()).orElseThrow().getStatus()).isEqualTo(fromStatus);
        assertThat(orderEventRepository.countByOrder_Id(order.getId())).isZero();
        assertThat(outboxEventRepository.countByAggregateId(order.getId())).isZero();
    }

    @ParameterizedTest
    @MethodSource("cancellableStatuses")
    void customerCanCancelConfiguredStatuses(OrderStatus orderStatus) throws Exception {
        Order order = saveOrder(orderStatus, 1);
        mockMvc.perform(post("/api/v1/orders/{id}/cancel", order.getId())
                        .with(user(customer))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"expectedVersion":1}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"))
                .andExpect(jsonPath("$.version").value(2));

        Order cancelled = orderRepository.findById(order.getId()).orElseThrow();
        assertThat(cancelled.getCancelledAt()).isNotNull();
        assertThat(orderEventRepository.countByOrder_Id(order.getId())).isEqualTo(1);
        assertThat(outboxEventRepository.countByAggregateId(order.getId())).isEqualTo(1);
    }

    @ParameterizedTest
    @MethodSource("nonCancellableStatuses")
    void customerCannotCancelOutsideConfiguredStatuses(OrderStatus status) throws Exception {
        Order order = saveOrder(status, 1);
        mockMvc.perform(post("/api/v1/orders/{id}/cancel", order.getId())
                        .with(user(customer))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"expectedVersion":1}
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("ORDER_CANCELLATION_NOT_ALLOWED"))
                .andExpect(jsonPath("$.requestId").isNotEmpty());
        assertThat(orderRepository.findById(order.getId()).orElseThrow().getStatus()).isEqualTo(status);
    }

    @Test
    void staleVersionIsRejected() throws Exception {
        Order order = saveOrder(OrderStatus.CREATED, 2);
        mockMvc.perform(post("/api/v1/orders/{id}/cancel", order.getId())
                        .with(user(customer))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"expectedVersion":1}
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("ORDER_VERSION_CONFLICT"));
    }

    @Test
    void outboxFailureRollsBackOrderStatusAndOrderEvent() throws Exception {
        Order order = saveOrder(OrderStatus.CREATED, 1);
        doThrow(new IllegalStateException("simulated outbox failure"))
                .when(outboxEventRepositorySpy).save(any());

        mockMvc.perform(patch("/api/v1/orders/{id}/status", order.getId())
                        .with(user(admin))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(transitionBody(OrderStatus.PAYMENT_PENDING, 1)))
                .andExpect(status().isInternalServerError());

        Order unchanged = orderRepository.findById(order.getId()).orElseThrow();
        assertThat(unchanged.getStatus()).isEqualTo(OrderStatus.CREATED);
        assertThat(unchanged.getVersion()).isEqualTo(1);
        assertThat(orderEventRepository.countByOrder_Id(order.getId())).isZero();
        assertThat(outboxEventRepository.countByAggregateId(order.getId())).isZero();
    }

    @Test
    void customersOnlySeeTheirOwnOrdersAndAdminsCanInspectAnyOrder() throws Exception {
        Order order = saveOrder(OrderStatus.CREATED, 1);
        User otherCustomer = saveUser(Role.CUSTOMER);
        Address otherAddress = addressRepository.save(Address.builder()
                .user(otherCustomer)
                .label("Home")
                .recipientName("Other Customer")
                .phone("+94114445555")
                .addressLine1("2 Main Street")
                .city("Colombo")
                .district("Colombo")
                .isDefault(true)
                .build());
        Order otherOrder = saveOrder(otherCustomer, otherAddress, OrderStatus.CREATED, 1);

        mockMvc.perform(get("/api/v1/orders")
                        .with(user(customer)))
                .andExpect(status().isOk())
                        .andExpect(jsonPath("$.page.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].id").value(order.getId().toString()));

        mockMvc.perform(get("/api/v1/orders/{id}", order.getId())
                                .with(user(customer)))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.id").value(order.getId().toString()));

        mockMvc.perform(get("/api/v1/orders/{id}", order.getId())
                                .with(user(otherCustomer)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("NOT_FOUND"));

        mockMvc.perform(get("/api/v1/orders/{id}", order.getId())
                        .with(user(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(order.getId().toString()));
        assertThat(otherOrder.getCustomer().getId()).isEqualTo(otherCustomer.getId());
    }

    @Test
    void concurrentDoubleCancelAllowsExactlyOneRequest() throws Exception {
        Order order = saveOrder(OrderStatus.CREATED, 1);
        CountDownLatch start = new CountDownLatch(1);
        ExecutorService executor = Executors.newFixedThreadPool(2);
        try {
            Future<Integer> first = executor.submit(() -> cancelAfter(start, order));
            Future<Integer> second = executor.submit(() -> cancelAfter(start, order));
            start.countDown();
            List<Integer> results = List.of(
                    first.get(15, TimeUnit.SECONDS),
                    second.get(15, TimeUnit.SECONDS)
            );
            assertThat(results).containsExactlyInAnyOrder(200, 409);
        } finally {
            executor.shutdownNow();
        }

        assertThat(orderRepository.findById(order.getId()).orElseThrow().getStatus())
                .isEqualTo(OrderStatus.CANCELLED);
        assertThat(orderEventRepository.countByOrder_Id(order.getId())).isEqualTo(1);
        assertThat(outboxEventRepository.countByAggregateId(order.getId())).isEqualTo(1);
    }

    private int cancelAfter(CountDownLatch start, Order order) throws Exception {
        start.await(10, TimeUnit.SECONDS);
        return mockMvc.perform(post("/api/v1/orders/{id}/cancel", order.getId())
                        .with(user(customer))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"expectedVersion":1}
                                """))
                .andReturn()
                .getResponse()
                .getStatus();
    }

    private User saveUser(Role role) {
        return userRepository.save(User.builder()
                .firstName("Lifecycle")
                .lastName(role.name())
                .email(role.name().toLowerCase() + "-" + UUID.randomUUID() + "@test.example")
                .password("not-used")
                .role(role)
                .enabled(true)
                .build());
    }

    private Order saveOrder(OrderStatus status, int version) {
        return saveOrder(customer, address, status, version);
    }

    private Order saveOrder(User owner, Address deliveryAddress, OrderStatus status, int version) {
        return orderRepository.saveAndFlush(Order.builder()
                .orderNumber("FO-" + UUID.randomUUID())
                .customer(owner)
                .storeId(UUID.randomUUID())
                .address(deliveryAddress)
                .addressSnapshot(Map.of("line1", deliveryAddress.getAddressLine1()))
                .status(status)
                .subtotal(new BigDecimal("20.00"))
                .deliveryFee(new BigDecimal("2.00"))
                .discountAmount(BigDecimal.ZERO)
                .totalAmount(new BigDecimal("22.00"))
                .commissionRate(new BigDecimal("0.1000"))
                .commissionAmount(new BigDecimal("2.00"))
                .storeAmount(new BigDecimal("18.00"))
                .version(version)
                .build());
    }

    private String transitionBody(OrderStatus targetStatus, int expectedVersion) {
        return JsonMapper.builder().build().createObjectNode()
                .put("targetStatus", targetStatus.name())
                .put("expectedVersion", expectedVersion)
                .toString();
    }

    private static Stream<Arguments> validTransitions() {
        return Stream.of(
                arguments(OrderStatus.CREATED, OrderStatus.PAYMENT_PENDING),
                arguments(OrderStatus.CREATED, OrderStatus.PAYMENT_FAILED),
                arguments(OrderStatus.CREATED, OrderStatus.CONFIRMED),
                arguments(OrderStatus.CREATED, OrderStatus.CANCELLED),
                arguments(OrderStatus.CREATED, OrderStatus.EXPIRED),
                arguments(OrderStatus.PAYMENT_PENDING, OrderStatus.PAYMENT_FAILED),
                arguments(OrderStatus.PAYMENT_PENDING, OrderStatus.CONFIRMED),
                arguments(OrderStatus.PAYMENT_PENDING, OrderStatus.CANCELLED),
                arguments(OrderStatus.PAYMENT_PENDING, OrderStatus.EXPIRED),
                arguments(OrderStatus.PAYMENT_FAILED, OrderStatus.PAYMENT_PENDING),
                arguments(OrderStatus.PAYMENT_FAILED, OrderStatus.EXPIRED),
                arguments(OrderStatus.CONFIRMED, OrderStatus.ACCEPTED),
                arguments(OrderStatus.CONFIRMED, OrderStatus.CANCELLED),
                arguments(OrderStatus.ACCEPTED, OrderStatus.PACKING),
                arguments(OrderStatus.PACKING, OrderStatus.READY_FOR_PICKUP),
                arguments(OrderStatus.READY_FOR_PICKUP, OrderStatus.DRIVER_ASSIGNED),
                arguments(OrderStatus.DRIVER_ASSIGNED, OrderStatus.PICKED_UP),
                arguments(OrderStatus.PICKED_UP, OrderStatus.OUT_FOR_DELIVERY),
                arguments(OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED),
                arguments(OrderStatus.DELIVERED, OrderStatus.REFUNDED)
        );
    }

    private static Stream<Arguments> invalidTransitions() {
        return Stream.of(
                arguments(OrderStatus.CREATED, OrderStatus.DELIVERED),
                arguments(OrderStatus.PAYMENT_FAILED, OrderStatus.CONFIRMED),
                arguments(OrderStatus.PACKING, OrderStatus.CANCELLED),
                arguments(OrderStatus.DELIVERED, OrderStatus.CANCELLED),
                arguments(OrderStatus.CANCELLED, OrderStatus.CONFIRMED),
                arguments(OrderStatus.REFUNDED, OrderStatus.PAYMENT_PENDING)
        );
    }

    private static Stream<Arguments> cancellableStatuses() {
        return Stream.of(
                arguments(OrderStatus.CREATED),
                arguments(OrderStatus.PAYMENT_PENDING),
                arguments(OrderStatus.CONFIRMED)
        );
    }

    private static Stream<Arguments> nonCancellableStatuses() {
        return Stream.of(OrderStatus.values())
                .filter(status -> status != OrderStatus.CREATED
                        && status != OrderStatus.PAYMENT_PENDING
                        && status != OrderStatus.CONFIRMED)
                .map(Arguments::of);
    }
}
