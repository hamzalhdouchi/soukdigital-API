package com.solar.shop.product.dto;

import java.math.BigDecimal;
import java.util.List;

public record ProductDetailResponse(
    Long id,
    String sku,
    String slug,
    String name,
    String shortDescription,
    String longDescription,
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
    boolean isFeatured,
    boolean isActive,
    String metaTitle,
    String metaDescription,
    CategoryInfo category,
    BrandInfo brand,
    List<ImageInfo> images,
    List<VariantInfo> variants
) {
    public record CategoryInfo(Long id, String slug, String name) {}
    public record BrandInfo(Long id, String slug, String name, String logoUrl) {}
    public record ImageInfo(Long id, String url, String altText, boolean isPrimary) {}
    public record VariantInfo(
        Long id,
        String reference,
        String label,
        BigDecimal priceHt,
        BigDecimal priceTtc,
        String currency,
        boolean isDefault,
        boolean isActive
    ) {}
}
