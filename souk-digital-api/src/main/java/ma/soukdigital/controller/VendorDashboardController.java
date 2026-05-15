package ma.soukdigital.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import ma.soukdigital.dto.*;
import ma.soukdigital.entity.OrderStatus;
import ma.soukdigital.entity.Vendor;
import ma.soukdigital.exception.EntityNotFoundException;
import ma.soukdigital.repository.VendorRepository;
import ma.soukdigital.service.ProductService;
import ma.soukdigital.service.VendorDashboardService;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/vendor/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('VENDOR')")
@Tag(name = "Vendor Dashboard", description = "Analytics and stats for the vendor's own store")
@SecurityRequirement(name = "bearerAuth")
public class VendorDashboardController {

    private final VendorDashboardService dashboardService;
    private final VendorRepository       vendorRepository;
    private final ProductService         productService;

    @GetMapping("/stats")
    @Operation(summary = "Overall KPIs — revenue, orders, products, rating")
    public DashboardStatsDto stats(@AuthenticationPrincipal UserDetails principal) {
        return dashboardService.getStats(vendorId(principal));
    }

    @GetMapping("/revenue-trend")
    @Operation(summary = "Monthly revenue for the last N months (default 12)")
    public List<MonthlyRevenueDto> revenueTrend(
            @AuthenticationPrincipal UserDetails principal,
            @RequestParam(defaultValue = "12") int months) {
        return dashboardService.getRevenueTrend(vendorId(principal), months);
    }

    @GetMapping("/orders")
    @Operation(summary = "Paginated order list, optionally filtered by status")
    public Page<OrderSummaryDto> orders(
            @AuthenticationPrincipal UserDetails principal,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return dashboardService.getRecentOrders(vendorId(principal), status, page, size);
    }

    @GetMapping("/top-products")
    @Operation(summary = "Top selling products by units sold")
    public List<TopProductDto> topProducts(
            @AuthenticationPrincipal UserDetails principal,
            @RequestParam(defaultValue = "5") int limit) {
        return dashboardService.getTopProducts(vendorId(principal), limit);
    }

    @GetMapping("/orders-status")
    @Operation(summary = "Order count breakdown by status")
    public Map<String, Long> ordersByStatus(@AuthenticationPrincipal UserDetails principal) {
        return dashboardService.getOrdersByStatus(vendorId(principal));
    }

    @GetMapping("/products")
    @Operation(summary = "All vendor products (active + inactive)")
    public Page<ProductSummaryDto> products(
            @AuthenticationPrincipal UserDetails principal,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "50") int size) {
        UUID userId = UUID.fromString(principal.getUsername());
        return productService.findOwnProducts(userId, page, size);
    }

    // ── Helper ────────────────────────────────────────────────

    private UUID vendorId(UserDetails principal) {
        UUID userId = UUID.fromString(principal.getUsername());
        Vendor vendor = vendorRepository.findByUserId(userId)
            .orElseThrow(() -> new EntityNotFoundException("Vendor profile not found"));
        return vendor.getId();
    }
}
