package com.solar.shop.product.controller;

import com.solar.shop.common.dto.ApiResponse;
import com.solar.shop.common.dto.PageResponse;
import com.solar.shop.product.dto.ProductCreateRequest;
import com.solar.shop.product.dto.ProductDetailResponse;
import com.solar.shop.product.dto.ProductFilterRequest;
import com.solar.shop.product.dto.ProductUpdateRequest;
import com.solar.shop.product.service.AdminProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final AdminProductService adminProductService;

    @GetMapping
    public ApiResponse<PageResponse<ProductDetailResponse>> list(
            ProductFilterRequest filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        String[] parts = sort.split(",");
        Sort.Direction direction = parts.length > 1 && parts[1].equalsIgnoreCase("asc")
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        var pageable = PageRequest.of(page, size, Sort.by(direction, parts[0]));
        return ApiResponse.ok(adminProductService.findAll(filter, pageable));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ProductDetailResponse> create(@Valid @RequestBody ProductCreateRequest req) {
        return ApiResponse.ok(adminProductService.create(req), "Produit créé");
    }

    @PutMapping("/{id}")
    public ApiResponse<ProductDetailResponse> update(
            @PathVariable Long id,
            @RequestBody ProductUpdateRequest req
    ) {
        return ApiResponse.ok(adminProductService.update(id, req));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        adminProductService.softDelete(id);
    }
}
