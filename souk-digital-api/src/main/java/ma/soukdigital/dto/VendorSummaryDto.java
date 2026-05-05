package ma.soukdigital.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record VendorSummaryDto(
    UUID id,
    String slug,
    String name,
    String nameAr,
    String city,
    BigDecimal rating,
    int reviewCount,
    int productCount,
    boolean artisan,
    boolean verified,
    String avatarUrl,
    String bannerUrl
) {}
