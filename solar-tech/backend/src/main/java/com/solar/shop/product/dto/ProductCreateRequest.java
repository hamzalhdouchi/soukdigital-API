package com.solar.shop.product.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public record ProductCreateRequest(
        @NotBlank @Size(max = 100) String sku,
        @NotBlank String name,
        String shortDescription,
        String longDescription,
        Long categoryId,
        Long brandId,
        @NotBlank String productType,
        String installationType,
        String phaseType,
        String injectionType,
        BigDecimal basePowerKwc,
        BigDecimal inverterPowerVa,
        BigDecimal batteryCapacityKwh,
        String voltageOutput,
        Integer panelCount,
        Integer warrantyYears,
        BigDecimal weight,
        String dimensions,
        String metaTitle,
        String metaDescription,
        boolean isFeatured,
        boolean isActive,
        @Valid List<VariantRequest> variants
) {
    public record VariantRequest(
            @NotBlank String reference,
            @NotBlank String label,
            @NotNull BigDecimal priceHt,
            @NotNull BigDecimal priceTtc,
            String currency,
            boolean isDefault,
            boolean isActive,
            Integer stockQuantity
    ) {}
}
