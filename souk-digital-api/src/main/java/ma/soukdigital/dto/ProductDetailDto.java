package ma.soukdigital.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ProductDetailDto(
    UUID id,
    String slug,
    String name,
    String nameAr,
    String description,
    String descriptionAr,
    BigDecimal price,
    BigDecimal originalPrice,
    List<String> images,
    BigDecimal rating,
    int reviewCount,
    String badge,
    boolean inStock,
    int stockCount,
    boolean freeDelivery,
    String city,
    CategoryResponse category,
    ProductVendorDto vendor
) {}
