package Freshora.Backend;

import Freshora.Backend.order.catalog.CatalogPort;
import Freshora.Backend.order.entity.Order;
import Freshora.Backend.order.entity.OrderEvent;
import Freshora.Backend.order.repository.*;
import Freshora.Backend.user.entity.Address;
import Freshora.Backend.user.entity.Role;
import Freshora.Backend.user.entity.User;
import Freshora.Backend.user.repository.AddressRepository;
import Freshora.Backend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
class OrderApiTests {
    private static final UUID STORE_ID = UUID.fromString("11111111-1111-4111-8111-111111111111");
    private static final UUID PRODUCT_ID = UUID.fromString("22222222-2222-4222-8222-222222222222");

    @Autowired
    private WebApplicationContext context;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private AddressRepository addressRepository;
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private OrderItemRepository orderItemRepository;
    @Autowired
    private IdempotencyRecordRepository idempotencyRecordRepository;
    @Autowired
    private OrderEventRepository orderEventRepository;
    @Autowired
    private OutboxEventRepository outboxEventRepository;

    @MockitoBean
    private CatalogPort catalogPort;
    @MockitoSpyBean
    private OrderEventRepository eventRepositorySpy;

    private final ObjectMapper objectMapper = JsonMapper.builder().build();
    private MockMvc mockMvc;
    private User customer;
    private Address ownedAddress;
    private String requestJson;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
        reset(catalogPort);

        customer = userRepository.save(User.builder()
                .firstName("Order")
                .lastName("Customer")
                .email("order-" + UUID.randomUUID() + "@test.example")
                .password("not-used")
                .role(Role.CUSTOMER)
                .enabled(true)
                .build());
        ownedAddress = saveAddress(customer);
        requestJson = """
                {
                  "storeId": "%s",
                  "addressId": %d,
                  "couponCode": null,
                  "paymentMethod": "CARD",
                  "items": [{"productId": "%s", "quantity": 2}]
                }
                """.formatted(STORE_ID, ownedAddress.getId(), PRODUCT_ID);

        when(catalogPort.quote(eq(STORE_ID), anyList(), isNull())).thenReturn(validQuote());
    }

    @Test
    void sameIdempotencyKeyAndPayloadTenTimesCreatesOneOrderAndReplaysResponse() throws Exception {
        String firstOrderId = null;
        String firstResponse = null;
        for (int attempt = 0; attempt < 10; attempt++) {
            var result = mockMvc.perform(post("/api/v1/orders")
                            .with(user(customer))
                            .with(csrf())
                            .header("Idempotency-Key", "same-request")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(requestJson))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.status").value("CREATED"))
                    .andExpect(jsonPath("$.subtotal").value(200.00))
                    .andExpect(jsonPath("$.deliveryFee").value(250.00))
                    .andExpect(jsonPath("$.totalAmount").value(450.00))
                    .andReturn();
            String responseBody = result.getResponse().getContentAsString();
            String orderId = objectMapper.readTree(responseBody)
                    .get("id").asString();
            if (firstOrderId == null) {
                firstOrderId = orderId;
                firstResponse = responseBody;
            } else {
                assertThat(orderId).isEqualTo(firstOrderId);
                assertThat(responseBody).isEqualTo(firstResponse);
            }
        }

        UUID createdId = UUID.fromString(firstOrderId);
        assertThat(orderRepository.countByCustomer_Id(customer.getId())).isEqualTo(1);
        assertThat(orderItemRepository.countByOrder_Id(createdId)).isEqualTo(1);
        assertThat(idempotencyRecordRepository.countByUser_Id(customer.getId())).isEqualTo(1);
        assertThat(orderEventRepository.countByOrder_Id(createdId)).isEqualTo(1);
        assertThat(outboxEventRepository.countByAggregateId(createdId)).isEqualTo(1);
        verify(catalogPort, times(1)).quote(eq(STORE_ID), anyList(), isNull());
    }

    @Test
    void sameKeyWithDifferentPayloadReturnsConflict() throws Exception {
        mockMvc.perform(post("/api/v1/orders")
                        .with(user(customer))
                        .with(csrf())
                        .header("Idempotency-Key", "same-request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isCreated());

        String changedRequest = requestJson.replace("\"quantity\": 2", "\"quantity\": 3");
        mockMvc.perform(post("/api/v1/orders")
                        .with(user(customer))
                        .with(csrf())
                        .header("Idempotency-Key", "same-request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(changedRequest))
                .andExpect(status().isConflict());

        assertThat(orderRepository.countByCustomer_Id(customer.getId())).isEqualTo(1);
    }

    @Test
    void failedOrderEventWriteRollsBackAllOrderWrites() throws Exception {
        doThrow(new IllegalStateException("simulated event persistence failure"))
                .when(eventRepositorySpy).save(any(OrderEvent.class));

        mockMvc.perform(post("/api/v1/orders")
                        .with(user(customer))
                        .with(csrf())
                        .header("Idempotency-Key", "rollback-request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isInternalServerError());

        assertThat(orderRepository.countByCustomer_Id(customer.getId())).isZero();
        assertThat(idempotencyRecordRepository.countByUser_Id(customer.getId())).isZero();
    }

    @Test
    void customerCannotPlaceOrderUsingAnotherUsersAddress() throws Exception {
        User otherCustomer = userRepository.save(User.builder()
                .firstName("Other")
                .lastName("Customer")
                .email("other-" + UUID.randomUUID() + "@test.example")
                .password("not-used")
                .role(Role.CUSTOMER)
                .enabled(true)
                .build());
        Address otherAddress = saveAddress(otherCustomer);
        String foreignAddressRequest = requestJson.replace(
                "\"addressId\": " + ownedAddress.getId(),
                "\"addressId\": " + otherAddress.getId());

        mockMvc.perform(post("/api/v1/orders")
                        .with(user(customer))
                        .with(csrf())
                        .header("Idempotency-Key", "foreign-address")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(foreignAddressRequest))
                .andExpect(status().isNotFound());

        assertThat(orderRepository.countByCustomer_Id(customer.getId())).isZero();
    }

    private Address saveAddress(User user) {
        return addressRepository.save(Address.builder()
                .user(user)
                .label("Home")
                .recipientName("Order Customer")
                .phone("+94112223333")
                .addressLine1("1 Main Street")
                .city("Colombo")
                .district("Colombo")
                .isDefault(true)
                .build());
    }

    private CatalogPort.CatalogQuote validQuote() {
        return new CatalogPort.CatalogQuote(true, true, new BigDecimal("250.00"),
                new BigDecimal("0.1000"), BigDecimal.ZERO,
                List.of(new CatalogPort.ProductQuote(PRODUCT_ID, "Fresh Apples",
                        new BigDecimal("100.00"), true, 20)));
    }
}
