package com.solar.shop.product.dto;

import java.math.BigDecimal;

public record ProductUpdateRequest(
        String name,
        String shortDescription,
        String longDescription,
        Long categoryId,
        Long brandId,
        String productType,
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
        Boolean isFeatured,
        Boolean isActive
) {}
