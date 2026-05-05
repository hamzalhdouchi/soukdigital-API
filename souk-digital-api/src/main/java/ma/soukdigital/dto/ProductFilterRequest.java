package ma.soukdigital.dto;

import java.math.BigDecimal;

public record ProductFilterRequest(
    String keyword,
    String category,
    BigDecimal minPrice,
    BigDecimal maxPrice,
    String city,
    boolean freeDelivery,
    boolean artisanOnly,
    String sort,       // newest | price_asc | price_desc | rating
    int page,
    int size
) {
    public ProductFilterRequest {
        if (page < 0) page = 0;
        if (size <= 0 || size > 100) size = 20;
        if (sort == null) sort = "newest";
    }
}
