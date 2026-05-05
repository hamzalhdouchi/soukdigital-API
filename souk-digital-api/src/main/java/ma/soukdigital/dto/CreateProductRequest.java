package ma.soukdigital.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CreateProductRequest(
    @NotBlank String name,
    @NotBlank String nameAr,
    String description,
    String descriptionAr,
    @NotNull @Positive BigDecimal price,
    BigDecimal originalPrice,
    @NotNull @Min(0) Integer stockCount,
    @NotNull UUID categoryId,
    String badge,
    String city,
    boolean freeDelivery,
    @Size(min = 1, max = 8) List<String> imageUrls
) {}
