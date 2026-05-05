package ma.soukdigital.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderItemDto(
    UUID productId,
    String productName,
    String productImage,
    UUID vendorId,
    String vendorName,
    BigDecimal price,
    int quantity,
    BigDecimal subtotal
) {}
