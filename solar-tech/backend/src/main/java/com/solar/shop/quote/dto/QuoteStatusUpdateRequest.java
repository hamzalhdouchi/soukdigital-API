package com.solar.shop.quote.dto;

import jakarta.validation.constraints.NotBlank;

public record QuoteStatusUpdateRequest(
        @NotBlank String status,
        String adminNotes
) {}
