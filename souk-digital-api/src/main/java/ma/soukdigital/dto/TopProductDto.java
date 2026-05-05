package ma.soukdigital.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record TopProductDto(
    UUID       productId,
    String     name,
    String     image,
    long       totalSold,
    BigDecimal revenue,
    BigDecimal rating
) {}
