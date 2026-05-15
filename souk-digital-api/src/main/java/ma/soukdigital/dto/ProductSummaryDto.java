package ma.soukdigital.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductSummaryDto(
    UUID id,
    String slug,
    String name,
    String nameAr,
    BigDecimal price,
    BigDecimal originalPrice,
    String image,
    BigDecimal rating,
    int reviewCount,
    String badge,
    boolean inStock,
    boolean freeDelivery,
    String city,
    ProductVendorDto vendor,
    boolean isActive
) {}
