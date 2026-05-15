package com.solar.shop.quote.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public record QuoteCreateRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotBlank @Email String email,
        String phone,
        String company,
        String installationType,
        BigDecimal consumptionKwh,
        String location,
        BigDecimal budget,
        @NotBlank @Size(min = 10, max = 2000) String message,
        List<QuoteItemRequest> items
) {
    public record QuoteItemRequest(
            Long productId,
            Long variantId,
            String productName,
            String variantLabel,
            Integer quantity,
            BigDecimal unitPriceHt
    ) {}
}
