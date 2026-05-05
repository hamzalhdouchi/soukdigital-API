package ma.soukdigital.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record PromoCodeDto(
    UUID id,
    String code,
    BigDecimal discountPercent,
    Integer maxUses,
    int usedCount,
    OffsetDateTime expiresAt,
    boolean active,
    OffsetDateTime createdAt
) {}
