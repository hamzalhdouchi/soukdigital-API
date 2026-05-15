package com.solar.shop.brand.dto;

public record BrandResponse(
    Long id,
    String slug,
    String name,
    String description,
    String logoUrl,
    String websiteUrl
) {}
