package Freshora.Backend.order.catalog;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface CatalogPort {
    CatalogQuote quote(UUID storeId, List<RequestedProduct> products, String couponCode);

    record RequestedProduct(UUID productId, int quantity) {
    }

    record CatalogQuote(
            boolean storeActive,
            boolean storeOpen,
            BigDecimal deliveryFee,
            BigDecimal commissionRate,
            BigDecimal discountAmount,
            List<ProductQuote> products
    ) {
    }

    record ProductQuote(
            UUID productId,
            String productName,
            BigDecimal unitPrice,
            boolean active,
            int availableQuantity
    ) {
    }
}
