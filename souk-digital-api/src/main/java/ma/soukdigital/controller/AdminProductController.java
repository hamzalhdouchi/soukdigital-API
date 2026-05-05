package ma.soukdigital.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import ma.soukdigital.dto.ProductSummaryDto;
import ma.soukdigital.service.AdminService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/admin/products")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin — Products", description = "Product moderation including all inactive listings")
@SecurityRequirement(name = "bearerAuth")
public class AdminProductController {

    private final AdminService adminService;

    @GetMapping
    @Operation(summary = "List all products including inactive ones")
    public Page<ProductSummaryDto> list(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return adminService.listAllProducts(page, size);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Hard-delete a product permanently")
    public void delete(@PathVariable UUID id) {
        adminService.hardDeleteProduct(id);
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Force activate or deactivate a product")
    public ProductSummaryDto setActive(
            @PathVariable UUID id,
            @RequestBody Map<String, Boolean> body) {
        return adminService.setProductActive(id, body.get("active"));
    }
}
