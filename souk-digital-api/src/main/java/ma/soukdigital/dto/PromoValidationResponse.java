package ma.soukdigital.dto;

import java.math.BigDecimal;

public record PromoValidationResponse(
    boolean valid,
    String code,
    BigDecimal discountPercent,
    String message
) {}
