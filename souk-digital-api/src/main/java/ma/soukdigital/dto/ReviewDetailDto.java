package ma.soukdigital.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ReviewDetailDto(
    UUID id,
    int rating,
    String comment,
    boolean verifiedPurchase,
    OffsetDateTime createdAt,
    String authorName,
    String authorAvatar
) {}
