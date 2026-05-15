package com.solar.shop.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public record OrderCreateRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotBlank @Email String email,
        String phone,
        @NotBlank String address,
        @NotBlank String city,
        @NotBlank String postalCode,
        String country,
        String notes,
        @NotEmpty @Valid List<ItemRequest> items
) {
    public record ItemRequest(
            Long variantId,
            @NotBlank String productName,
            String variantLabel,
            @NotNull Integer quantity,
            @NotNull BigDecimal unitPriceHt,
            @NotNull BigDecimal unitPriceTtc
    ) {}
}
