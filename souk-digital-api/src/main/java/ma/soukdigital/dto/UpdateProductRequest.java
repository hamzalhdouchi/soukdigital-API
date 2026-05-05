package ma.soukdigital.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record UpdateProductRequest(
    String name,
    String nameAr,
    String description,
    String descriptionAr,
    @Positive BigDecimal price,
    BigDecimal originalPrice,
    @Min(0) Integer stockCount,
    UUID categoryId,
    String badge,
    String city,
    Boolean freeDelivery,
    List<String> imageUrls
) {}
