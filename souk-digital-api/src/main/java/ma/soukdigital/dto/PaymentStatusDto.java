package ma.soukdigital.dto;

import ma.soukdigital.entity.PaymentStatus;
import ma.soukdigital.entity.TransactionStatus;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record PaymentStatusDto(
    UUID orderId,
    PaymentStatus orderPaymentStatus,
    TransactionStatus transactionStatus,
    String provider,
    String providerRef,
    BigDecimal amount,
    OffsetDateTime createdAt
) {}
