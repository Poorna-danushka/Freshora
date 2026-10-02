package Freshora.Backend.application.dto;

import java.util.List;

public record MyApplicationsResponse(
        List<StoreApplicationResponse> stores,
        List<DriverApplicationResponse> drivers
) {}
