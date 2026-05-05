package ma.soukdigital.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record VendorRevenueDto(UUID id, String name, String slug, BigDecimal revenue, long orderCount) {}
