package ma.soukdigital.dto;

import java.math.BigDecimal;

public record MonthlyRevenueDto(
    String     month,
    BigDecimal revenue,
    long       orderCount
) {}
