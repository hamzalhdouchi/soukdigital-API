package ma.soukdigital.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record AdminVendorDto(
    UUID           id,
    String         name,
    String         slug,
    String         city,
    boolean        verified,
    boolean        artisan,
    BigDecimal     rating,
    int            reviewCount,
    int            productCount,
    OffsetDateTime createdAt,
    String         ownerEmail
) {}
