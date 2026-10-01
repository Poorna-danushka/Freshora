package Freshora.Backend.order.catalog;

import Freshora.Backend.exception.ServiceUnavailableException;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
public class NotImplementedCatalogAdapter implements CatalogPort {
    @Override
    public CatalogQuote quote(UUID storeId, List<RequestedProduct> products, String couponCode) {
        throw new ServiceUnavailableException("Catalog pricing is not implemented yet");
    }
}
