package ma.soukdigital.dto;

import java.math.BigDecimal;

public record DashboardStatsDto(
    BigDecimal revenueThisMonth,
    BigDecimal revenueTotal,
    Double     revenueGrowthPct,
    long       ordersThisMonth,
    long       ordersTotal,
    Double     ordersGrowthPct,
    long       activeProducts,
    Double     averageRating,
    int        reviewCount
) {}
