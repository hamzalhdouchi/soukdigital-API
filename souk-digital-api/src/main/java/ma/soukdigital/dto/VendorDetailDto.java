package ma.soukdigital.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record VendorDetailDto(
    UUID id,
    UUID userId,
    String slug,
    String name,
    String nameAr,
    String city,
    String description,
    String descriptionAr,
    BigDecimal rating,
    int reviewCount,
    int productCount,
    int followerCount,
    boolean artisan,
    boolean verified,
    String avatarUrl,
    String bannerUrl,
    LocalDate memberSince
) {}
