package com.solar.shop.order.controller;

import com.solar.shop.common.dto.ApiResponse;
import com.solar.shop.common.dto.PageResponse;
import com.solar.shop.order.dto.OrderCreateRequest;
import com.solar.shop.order.dto.OrderResponse;
import com.solar.shop.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/api/orders")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<OrderResponse> create(
            @Valid @RequestBody OrderCreateRequest req,
            Principal principal
    ) {
        String email = principal != null ? principal.getName() : null;
        return ApiResponse.ok(orderService.create(req, email), "Commande créée avec succès");
    }

    @GetMapping("/api/orders/me")
    public ApiResponse<PageResponse<OrderResponse>> myOrders(
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ApiResponse.ok(orderService.findByUser(principal.getName(), pageable));
    }

    @GetMapping("/api/admin/orders")
    public ApiResponse<PageResponse<OrderResponse>> adminList(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ApiResponse.ok(orderService.findAll(status, pageable));
    }

    @GetMapping("/api/admin/orders/{id}")
    public ApiResponse<OrderResponse> adminGet(@PathVariable Long id) {
        return ApiResponse.ok(orderService.findById(id));
    }

    @PatchMapping("/api/admin/orders/{id}/status")
    public ApiResponse<OrderResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        return ApiResponse.ok(orderService.updateStatus(id, status));
    }
}
