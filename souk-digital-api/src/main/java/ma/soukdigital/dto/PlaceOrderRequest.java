package ma.soukdigital.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import ma.soukdigital.entity.PaymentMethod;

import java.util.List;

public record PlaceOrderRequest(
    @NotEmpty @Valid List<OrderItemRequest> items,
    @NotNull @Valid DeliveryAddressRequest address,
    @NotNull PaymentMethod paymentMethod,
    String promoCode
) {}
