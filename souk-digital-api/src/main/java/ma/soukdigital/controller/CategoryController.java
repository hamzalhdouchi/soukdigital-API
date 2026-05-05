package ma.soukdigital.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import ma.soukdigital.dto.CategoryResponse;
import ma.soukdigital.dto.ProductFilterRequest;
import ma.soukdigital.dto.ProductSummaryDto;
import ma.soukdigital.service.CategoryService;
import ma.soukdigital.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
@Tag(name = "Categories", description = "Product categories")
public class CategoryController {

    private final CategoryService categoryService;
    private final ProductService  productService;

    @GetMapping
    @Operation(summary = "List all active categories")
    public List<CategoryResponse> findAll() {
        return categoryService.findAll();
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get category by slug")
    public CategoryResponse findBySlug(@PathVariable String slug) {
        return categoryService.findBySlug(slug);
    }

    @GetMapping("/{slug}/products")
    @Operation(summary = "Get products in a category")
    public Page<ProductSummaryDto> findProducts(
            @PathVariable String slug,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "newest") String sort) {
        ProductFilterRequest filter = new ProductFilterRequest(
            null, slug, null, null, null, false, false, sort, page, size);
        return productService.findAll(filter);
    }
}
