package com.solar.shop.product.controller;

import com.solar.shop.common.dto.ApiResponse;
import com.solar.shop.common.dto.PageResponse;
import com.solar.shop.product.dto.ProductDetailResponse;
import com.solar.shop.product.dto.ProductFilterRequest;
import com.solar.shop.product.dto.ProductSummaryResponse;
import com.solar.shop.product.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Products")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Lister les produits avec filtres et pagination")
    public ResponseEntity<ApiResponse<PageResponse<ProductSummaryResponse>>> getProducts(
        ProductFilterRequest filter,
        @RequestParam(defaultValue = "0")  int page,
        @RequestParam(defaultValue = "12") int size,
        @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        String[] parts = sort.split(",");
        Sort.Direction dir = parts.length > 1 && parts[1].equalsIgnoreCase("asc")
            ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, parts[0]));
        return ResponseEntity.ok(ApiResponse.ok(productService.findAll(filter, pageable)));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Détail d'un produit par son slug")
    public ResponseEntity<ApiResponse<ProductDetailResponse>> getProduct(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.ok(productService.findBySlug(slug)));
    }
}
