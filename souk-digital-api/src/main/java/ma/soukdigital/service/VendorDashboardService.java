package ma.soukdigital.service;

import lombok.RequiredArgsConstructor;
import ma.soukdigital.dto.*;
import ma.soukdigital.entity.*;
import ma.soukdigital.exception.EntityNotFoundException;
import ma.soukdigital.repository.*;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VendorDashboardService {

    private final VendorRepository   vendorRepository;
    private final OrderRepository    orderRepository;
    private final ProductRepository  productRepository;

    public DashboardStatsDto getStats(UUID vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
            .orElseThrow(() -> new EntityNotFoundException("Vendor not found"));

        OffsetDateTime startOfMonth     = YearMonth.now().atDay(1).atStartOfDay().atOffset(ZoneOffset.UTC);
        OffsetDateTime startOfLastMonth = YearMonth.now().minusMonths(1).atDay(1).atStartOfDay().atOffset(ZoneOffset.UTC);
        OffsetDateTime endOfLastMonth   = startOfMonth;

        BigDecimal revThis  = orZero(orderRepository.sumRevenueByVendorSince(vendorId, startOfMonth));
        BigDecimal revLast  = revenueInRange(vendorId, startOfLastMonth, endOfLastMonth);
        OffsetDateTime epoch = OffsetDateTime.of(2000, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC);
        BigDecimal revTotal = orZero(orderRepository.sumRevenueByVendorSince(vendorId, epoch));

        long ordThis  = orderRepository.countDeliveredOrdersByVendorSince(vendorId, startOfMonth);
        long ordLast  = orderRepository.countDeliveredOrdersByVendorSince(vendorId, startOfLastMonth) - ordThis;
        long ordTotal = orderRepository.countDeliveredOrdersByVendorSince(vendorId, epoch);

        long activeProducts = productRepository.countByVendorIdAndIsActiveTrue(vendorId);

        return new DashboardStatsDto(
            revThis,
            revTotal,
            growthPct(revLast, revThis),
            ordThis,
            ordTotal,
            growthPct(BigDecimal.valueOf(ordLast), BigDecimal.valueOf(ordThis)),
            activeProducts,
            vendor.getRating() != null ? vendor.getRating().doubleValue() : null,
            vendor.getReviewCount()
        );
    }

    public List<MonthlyRevenueDto> getRevenueTrend(UUID vendorId, int months) {
        OffsetDateTime from = YearMonth.now().minusMonths(months - 1L).atDay(1).atStartOfDay().atOffset(ZoneOffset.UTC);
        List<Object[]> rows = orderRepository.monthlyRevenueByVendor(vendorId, from);
        return rows.stream()
            .map(r -> new MonthlyRevenueDto(
                (String) r[0],
                new BigDecimal(r[1].toString()),
                ((Number) r[2]).longValue()))
            .toList();
    }

    public Page<OrderSummaryDto> getRecentOrders(UUID vendorId, OrderStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orders = status == null
            ? orderRepository.findByVendorId(vendorId, pageable)
            : orderRepository.findByVendorIdAndStatus(vendorId, status, pageable);
        return orders.map(this::toOrderSummary);
    }

    public List<TopProductDto> getTopProducts(UUID vendorId, int limit) {
        List<Object[]> rows = productRepository.findTopProductsByVendor(
            vendorId, PageRequest.of(0, limit));
        return rows.stream().map(r -> new TopProductDto(
            (UUID)       r[0],
            (String)     r[1],
            (String)     r[5],
            ((Number)    r[2]).longValue(),
            new BigDecimal(r[3].toString()),
            r[4] != null ? new BigDecimal(r[4].toString()) : null
        )).toList();
    }

    public Map<String, Long> getOrdersByStatus(UUID vendorId) {
        List<Object[]> rows = orderRepository.countOrdersByStatusForVendor(vendorId);
        Map<String, Long> result = new LinkedHashMap<>();
        for (OrderStatus s : OrderStatus.values()) result.put(s.name(), 0L);
        rows.forEach(r -> result.put(r[0].toString(), ((Number) r[1]).longValue()));
        return result;
    }

    // ── Helpers ───────────────────────────────────────────────

    private BigDecimal orZero(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }

    private BigDecimal revenueInRange(UUID vendorId, OffsetDateTime from, OffsetDateTime to) {
        // revenue[from..∞] minus revenue[to..∞] = revenue[from..to)
        BigDecimal sinceFrom = orZero(orderRepository.sumRevenueByVendorSince(vendorId, from));
        BigDecimal sinceTo   = orZero(orderRepository.sumRevenueByVendorSince(vendorId, to));
        return sinceFrom.subtract(sinceTo);
    }

    private Double growthPct(BigDecimal prev, BigDecimal curr) {
        if (prev == null || prev.compareTo(BigDecimal.ZERO) == 0) return null;
        return curr.subtract(prev)
            .divide(prev, 4, RoundingMode.HALF_UP)
            .multiply(BigDecimal.valueOf(100))
            .doubleValue();
    }

    private OrderSummaryDto toOrderSummary(Order o) {
        OrderItem first = o.getItems().isEmpty() ? null : o.getItems().get(0);
        return new OrderSummaryDto(
            o.getId(),
            o.getStatus(),
            o.getPaymentMethod(),
            o.getPaymentStatus(),
            o.getTotal(),
            o.getCreatedAt(),
            o.getItems().size(),
            first != null ? first.getProductName() : null,
            first != null ? first.getProductImage() : null
        );
    }
}
