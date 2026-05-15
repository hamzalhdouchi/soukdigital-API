package com.solar.shop.category.dto;

import java.util.List;

public record CategoryResponse(
    Long id,
    String slug,
    String name,
    String description,
    String imageUrl,
    Long parentId,
    int position,
    List<CategoryResponse> children
) {}
