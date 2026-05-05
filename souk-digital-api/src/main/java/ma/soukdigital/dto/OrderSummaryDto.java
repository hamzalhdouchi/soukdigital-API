package ma.soukdigital.dto;

import ma.soukdigital.entity.OrderStatus;
import ma.soukdigital.entity.PaymentMethod;
import ma.soukdigital.entity.PaymentStatus;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record OrderSummaryDto(
    UUID id,
    OrderStatus status,
    PaymentMethod paymentMethod,
    PaymentStatus paymentStatus,
    BigDecimal total,
    OffsetDateTime createdAt,
    int itemCount,
    String firstItemName,
    String firstItemImage
) {}
