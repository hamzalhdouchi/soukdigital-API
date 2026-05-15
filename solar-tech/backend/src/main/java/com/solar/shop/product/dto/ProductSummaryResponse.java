package com.solar.shop.product.dto;

import java.math.BigDecimal;

public record ProductSummaryResponse(
    Long id,
    String slug,
    String name,
    String shortDescription,
    String primaryImageUrl,
    String productType,
    String installationType,
    String phaseType,
    BigDecimal basePowerKwc,
    Boolean isFeatured,
    Long categoryId,
    String categorySlug,
    String categoryName,
    Long brandId,
    String brandName,
    String brandLogoUrl,
    // Default variant info
    Long variantId,
    BigDecimal priceHt,
    BigDecimal priceTtc,
    String currency,
    Integer stockQuantity
) {}
