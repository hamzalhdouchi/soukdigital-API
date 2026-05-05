package ma.soukdigital.dto;

import java.math.BigDecimal;
import java.util.List;

public record PlatformStatsDto(
    long       totalUsers,
    long       totalVendors,
    long       verifiedVendors,
    long       totalProducts,
    long       totalOrders,
    long       ordersThisWeek,
    long       newUsersThisWeek,
    BigDecimal revenueThisMonth,
    BigDecimal revenueTotal,
    BigDecimal averageOrderValue,
    List<CategoryStatDto> topCategories,
    List<VendorRevenueDto> topVendors
) {}
