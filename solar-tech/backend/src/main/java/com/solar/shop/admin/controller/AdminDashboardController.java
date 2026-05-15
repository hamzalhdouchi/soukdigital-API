package com.solar.shop.admin.controller;

import com.solar.shop.common.dto.ApiResponse;
import com.solar.shop.order.repository.OrderRepository;
import com.solar.shop.product.repository.ProductRepository;
import com.solar.shop.quote.repository.QuoteRepository;
import com.solar.shop.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final OrderRepository orderRepository;
    private final QuoteRepository quoteRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @GetMapping("/stats")
    public ApiResponse<StatsResponse> stats() {
        long totalOrders    = orderRepository.count();
        long pendingOrders  = orderRepository.findByStatus("pending", org.springframework.data.domain.Pageable.unpaged()).getTotalElements();
        long newQuotes      = quoteRepository.countByStatus("new");
        long totalProducts  = productRepository.count();
        long totalUsers     = userRepository.count();

        return ApiResponse.ok(new StatsResponse(totalOrders, pendingOrders, newQuotes, totalProducts, totalUsers));
    }

    public record StatsResponse(
            long totalOrders,
            long pendingOrders,
            long newQuotes,
            long totalProducts,
            long totalUsers
    ) {}
}
