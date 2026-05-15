package com.solar.shop.category.controller;

import com.solar.shop.category.dto.CategoryResponse;
import com.solar.shop.category.service.CategoryService;
import com.solar.shop.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Tag(name = "Categories")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "Arborescence complète des catégories actives")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getTree() {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getCategoryTree()));
    }
}
