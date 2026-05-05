package ma.soukdigital.dto;

import ma.soukdigital.entity.OrderStatus;
import ma.soukdigital.entity.PaymentMethod;
import ma.soukdigital.entity.PaymentStatus;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record OrderDetailDto(
    UUID id,
    OrderStatus status,
    PaymentMethod paymentMethod,
    PaymentStatus paymentStatus,
    BigDecimal subtotal,
    BigDecimal discountAmount,
    BigDecimal deliveryFee,
    BigDecimal total,
    String promoCode,
    String trackingNumber,
    OffsetDateTime createdAt,
    DeliveryAddressRequest deliveryAddress,
    List<OrderItemDto> items,
    BuyerDto buyer
) {}
