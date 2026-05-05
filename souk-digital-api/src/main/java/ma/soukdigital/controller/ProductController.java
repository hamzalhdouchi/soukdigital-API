package ma.soukdigital.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.soukdigital.dto.*;
import ma.soukdigital.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Product catalog")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "List products with filters")
    public Page<ProductSummaryDto> findAll(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String city,
            @RequestParam(defaultValue = "false") boolean freeDelivery,
            @RequestParam(defaultValue = "false") boolean artisanOnly,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return productService.findAll(new ProductFilterRequest(
            keyword, category, minPrice, maxPrice, city, freeDelivery, artisanOnly, sort, page, size));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get product detail by slug")
    public ProductDetailDto findBySlug(@PathVariable String slug) {
        return productService.findBySlug(slug);
    }

    @GetMapping("/{id}/related")
    @Operation(summary = "Get related products")
    public List<ProductSummaryDto> findRelated(@PathVariable UUID id) {
        return productService.findRelated(id, 4);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('VENDOR')")
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "Create product")
    public ProductDetailDto create(@Valid @RequestBody CreateProductRequest req,
                                   @AuthenticationPrincipal UserDetails user) {
        return productService.create(req, UUID.fromString(user.getUsername()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('VENDOR')")
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "Update product")
    public ProductDetailDto update(@PathVariable UUID id,
                                   @Valid @RequestBody UpdateProductRequest req,
                                   @AuthenticationPrincipal UserDetails user) {
        return productService.update(id, req, UUID.fromString(user.getUsername()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('VENDOR')")
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "Soft-delete product")
    public void delete(@PathVariable UUID id,
                       @AuthenticationPrincipal UserDetails user) {
        productService.delete(id, UUID.fromString(user.getUsername()));
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasRole('VENDOR')")
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "Toggle product active/inactive")
    public void toggleActive(@PathVariable UUID id,
                              @AuthenticationPrincipal UserDetails user) {
        productService.toggleActive(id, UUID.fromString(user.getUsername()));
    }
}
