package ma.soukdigital.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import ma.soukdigital.dto.OrderDetailDto;
import ma.soukdigital.dto.OrderSummaryDto;
import ma.soukdigital.entity.Order;
import ma.soukdigital.entity.OrderStatus;
import ma.soukdigital.service.AdminService;
import ma.soukdigital.service.OrderService;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/admin/orders")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin — Orders", description = "Order oversight and dispute resolution")
@SecurityRequirement(name = "bearerAuth")
public class AdminOrderController {

    private final AdminService adminService;
    private final OrderService orderService;

    @GetMapping
    @Operation(summary = "List all orders, optionally filtered by status")
    public Page<OrderSummaryDto> list(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return adminService.listOrders(status, page, size);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Full order detail")
    public OrderDetailDto get(@PathVariable UUID id) {
        return orderService.getOrderDetailAdmin(id);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Override order status (dispute resolution)")
    public OrderSummaryDto overrideStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        OrderStatus newStatus = OrderStatus.valueOf(body.get("status").toUpperCase());
        return adminService.overrideOrderStatus(id, newStatus);
    }

    @PostMapping("/{id}/refund")
    @Operation(summary = "Mark order as refunded")
    public OrderSummaryDto refund(@PathVariable UUID id) {
        return adminService.refundOrder(id);
    }
}
