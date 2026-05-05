package ma.soukdigital.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.soukdigital.dto.*;
import ma.soukdigital.entity.OrderStatus;
import ma.soukdigital.service.OrderService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer")
@Tag(name = "Orders", description = "Order placement and management")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Place a new order")
    public OrderDetailDto placeOrder(@Valid @RequestBody PlaceOrderRequest req,
                                     @AuthenticationPrincipal UserDetails user) {
        return orderService.placeOrder(req, UUID.fromString(user.getUsername()));
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get my orders")
    public Page<OrderSummaryDto> myOrders(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails user) {
        return orderService.getMyOrders(UUID.fromString(user.getUsername()), page, size);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get order detail")
    public OrderDetailDto getOrder(@PathVariable UUID id,
                                   @AuthenticationPrincipal UserDetails user) {
        return orderService.getOrderById(id, UUID.fromString(user.getUsername()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('VENDOR')")
    @Operation(summary = "Update order status (vendor)")
    public OrderDetailDto updateStatus(@PathVariable UUID id,
                                       @Valid @RequestBody UpdateOrderStatusRequest req,
                                       @AuthenticationPrincipal UserDetails user) {
        return orderService.updateStatus(id, req.status(), UUID.fromString(user.getUsername()));
    }

    @GetMapping("/vendor")
    @PreAuthorize("hasRole('VENDOR')")
    @Operation(summary = "Get vendor's orders")
    public Page<OrderSummaryDto> vendorOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails user) {
        return orderService.getVendorOrders(UUID.fromString(user.getUsername()), status, page, size);
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all orders (admin)")
    public Page<OrderSummaryDto> adminOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserDetails user) {
        return orderService.getVendorOrders(UUID.fromString(user.getUsername()), status, page, size);
    }
}
